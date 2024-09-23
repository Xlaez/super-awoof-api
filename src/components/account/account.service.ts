import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import {
  BadRequestException,
  Dolph,
  NotAcceptableException,
  NotFoundException,
  ServiceUnavaliableException,
  UnauthorizedException,
} from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { AccountModel, IAccount, IOtp, OtpModel } from "./account.model";
import { Pagination } from "mongoose-paginate-ts";
import {
  CreateAccountDto,
  ForgetPasswordDto,
  LoginDto,
  RequestOtpDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from "./account.dto";
import { LoginMode } from "./account.enum";
import {
  compareWithBcryptHash,
  hashWithBcrypt,
} from "@dolphjs/dolph/utilities";
import { Model } from "mongoose";
import { generateOtp } from "@/shared/helpers/otp_generator.helper";
import { EmailService } from "@/shared/services/email.service";
import { SmsService } from "@/shared/services/sms.service";
import { TokenService } from "../token/token.service";
import { isMTNNumber } from "@/shared/helpers/validate_phone_number.helper";
import { sterilizeAccount } from "./account.sterializer";

@InjectMongo("accountModel", AccountModel)
@InjectMongo("otpModel", OtpModel)
export class AccountService extends DolphServiceHandler<Dolph> {
  accountModel!: Pagination<IAccount>;
  otpModel!: Model<IOtp>;
  EmailService: EmailService;
  SmsService: SmsService;
  TokenService: TokenService;

  constructor() {
    super("accountservice");
    this.EmailService = new EmailService();
    this.SmsService = new SmsService();
    this.TokenService = new TokenService();
  }

  public async createAccount(dto: CreateAccountDto) {
    try {
      let account: IAccount | null | undefined;

      let loginMode = LoginMode.phone;

      if (dto.email?.length) {
        account = await this.getAccount({ email: dto.email });
        loginMode = LoginMode.email;
      } else if (dto.phone?.length) {
        const mtnNumber = isMTNNumber(dto.phone);

        if (!mtnNumber)
          throw new NotAcceptableException(
            "Expected an MTN phone number but got another service registered number"
          );

        dto.phone = mtnNumber;

        account = await this.getAccount({ phone: mtnNumber });
      }

      if (account)
        throw new BadRequestException(
          `An account with this ${
            loginMode === LoginMode.email ? "email" : "phone number"
          } already exists`
        );

      if (loginMode === LoginMode.email) {
        dto.password = await hashWithBcrypt({
          pureString: dto.password,
          salt: 10,
        });
      }

      account = await this.accountModel.create({ ...dto, loginMode });

      const otp = await this.generateOtp(account);

      if (loginMode === LoginMode.email) {
        this.EmailService.sendAccountVerificationMail(
          dto.email,
          otp.otp,
          dto.fullname
        );
      } else {
        //         this.SmsService.sendSms({
        //           sender: "Super Awoof",
        //           mobile: dto.phone,
        //           content: `
        // ${dto.fullname} here is your OTP: ${otp.otp}
        // `,
        //         });
      }
    } catch (e: any) {
      throw new Error(e);
    }
  }

  public async verifyAccount(dto: VerifyAccountDto) {
    const otp = await this.otpModel.findOne({
      otp: dto.otp,
      expires: { $gte: new Date() },
    });

    if (!otp)
      throw new BadRequestException(
        "otp has expired or is invalid, try requesting for another"
      );

    let user = await this.getAccount({ _id: otp.accountId });

    if (!user) throw new NotFoundException("Cannot find this account");

    const { accessExpiration, accessToken, refreshExpiration, refreshToken } =
      await this.TokenService.generateToken(user._id.toString());

    user.isVerified = true;
    await user.save();

    await otp.deleteOne({});

    return {
      accessToken,
      accessExpiration,
      refreshToken,
      refreshExpiration,
      account: sterilizeAccount(user),
    };
  }

  public async resendVerificationOtp(dto: RequestOtpDto) {
    const account = await this.getAccount({
      $or: [{ email: dto.emailOrPhone }, { phone: dto.emailOrPhone }],
    });

    if (!account) throw new NotFoundException("This account cannot be found");

    if (account.isVerified)
      throw new NotAcceptableException(
        "Your account has been verified already"
      );

    await this.otpModel.deleteOne({ accountId: account._id.toString() });

    const otp = await this.generateOtp(account);

    if (account.loginMode === LoginMode.email) {
      this.EmailService.sendAccountVerificationMail(
        account.email,
        otp.otp,
        account.fullname
      );
    } else {
      this.SmsService.sendSms({
        sender: "Super Awoof",
        mobile: account.phone,
        content: `
${account.fullname} here is your OTP: ${otp.otp}        
`,
      });
    }
  }

  public async login(dto: LoginDto) {
    let account: IAccount = null as IAccount;

    if (dto.email?.length) {
      account = await this.getAccount({ email: dto.email });
    } else if (dto.phone?.length) {
      const mtnNumber = isMTNNumber(dto.phone);

      if (!mtnNumber)
        throw new NotAcceptableException(
          "Expected an MTN phone number but got another service registered number"
        );

      account = await this.getAccount({ phone: mtnNumber });
    } else {
      throw new NotAcceptableException("Provide valid login credentials");
    }

    if (!account) throw new NotFoundException("Account Not Found");

    if (!account.isVerified)
      throw new BadRequestException(
        "Please verify your account in order to login"
      );

    if (account.loginMode === LoginMode.email) {
      const isValidPassword = compareWithBcryptHash({
        pureString: dto.password,
        hashString: account.password,
      });

      if (!isValidPassword)
        throw new BadRequestException("Incorrect Login Credentials");

      const { accessExpiration, accessToken, refreshExpiration, refreshToken } =
        await this.TokenService.generateToken(account._id.toString());

      return {
        accessExpiration,
        accessToken,
        refreshExpiration,
        refreshToken,
        account: sterilizeAccount(account),
      };
    } else if (account.loginMode === LoginMode.phone) {
      const otp = await this.generateOtp(account);

      try {
        this.SmsService.sendSms({
          sender: "Super Awoof",
          mobile: dto.phone,
          content: `
${account.fullname} here is your OTP: ${otp.otp}        
`,
        });
      } catch (e: any) {
        throw new ServiceUnavaliableException(e);
      }

      return { msg: "Otp sent" };
    } else {
      throw new NotAcceptableException("Provide valid login credentials");
    }
  }

  public async verifyOtp(dto: VerifyOtpDto) {
    const otp = await this.otpModel.findOne({
      otp: dto.otp,
      expires: { $gte: new Date() },
    });

    if (!otp)
      throw new BadRequestException(
        "otp has expired or is invalid, try requesting for another"
      );

    let user = await this.getAccount({ _id: otp.accountId });

    if (!user) throw new NotFoundException("Cannot find this account");

    if (!user.isVerified)
      throw new BadRequestException(
        "Cannot login without verifying your account"
      );

    const { accessExpiration, accessToken, refreshExpiration, refreshToken } =
      await this.TokenService.generateToken(user._id.toString());

    await otp.deleteOne({});

    return {
      accessExpiration,
      accessToken,
      refreshExpiration,
      refreshToken,
      account: sterilizeAccount(user),
    };
  }

  public async refreshTokens(token: string, user: string) {
    const refreshTokenDoc = await this.TokenService.verifyRefreshToken(token);

    if (user !== refreshTokenDoc.sub)
      throw new UnauthorizedException(
        "Cannot refresh session using stolen tokens"
      );

    const tokens = await this.TokenService.generateToken(refreshTokenDoc.sub);

    return tokens;
  }

  public async requestResetPasswordReset(dto: ForgetPasswordDto) {
    let account = await this.getAccount({ email: dto.email });

    if (!account) throw new NotFoundException("Cannot find this account");

    const otp = this.generateOtp(account);

    account.isVerified = false;
    await account.save();

    return this.EmailService.sendPasswordResetMail(
      account.email,
      (await otp).otp
    );
  }

  public async resetPassword(dto: ResetPasswordDto) {
    const otp = await this.otpModel.findOne({
      otp: dto.otp,
      expires: { $gte: new Date() },
    });

    if (!otp)
      throw new BadRequestException(
        "otp has expired or is invalid, try requesting for another"
      );

    const accountByEmail = await this.getAccount({ email: dto.email });

    let accountById = await this.getAccount({ _id: otp.accountId });

    if (!accountByEmail && !accountById)
      throw new NotFoundException("Cannot find the requested account");

    if (accountByEmail.email !== accountById.email)
      throw new NotAcceptableException(
        "You do not have access to this account"
      );

    accountById.isVerified = true;
    accountById.password = await hashWithBcrypt({
      pureString: dto.password,
      salt: 10,
    });

    await accountById.save();

    await otp.deleteOne();

    const { accessExpiration, accessToken, refreshExpiration, refreshToken } =
      await this.TokenService.generateToken(accountById._id.toString());

    return {
      accessToken,
      accessExpiration,
      refreshToken,
      refreshExpiration,
      account: sterilizeAccount(accountById),
    };
  }

  public async updatePassword(dto: UpdatePasswordDto, account: IAccount) {
    let user = await this.getAccount({ email: account.email });

    if (
      !compareWithBcryptHash({
        pureString: dto.oldPassword,
        hashString: user.password,
      })
    )
      throw new NotAcceptableException("Incorrect password");

    user.password = await hashWithBcrypt({
      pureString: dto.newPassword,
      salt: 10,
    });
    await user.save();

    return;
  }

  public async getAccount(filter: {}): Promise<IAccount> {
    return this.accountModel.findOne(filter);
  }

  private async generateOtp(account: IAccount) {
    let currentTime = new Date();
    currentTime.setMinutes(currentTime.getMinutes() + 4);

    const otp = await this.otpModel.create({
      otp: generateOtp(),
      expires: currentTime,
      accountId: account._id,
    });

    return otp;
  }

  public async deleteAccount(accountId: string) {
    return this.accountModel.deleteOne({ _id: accountId });
  }
}
