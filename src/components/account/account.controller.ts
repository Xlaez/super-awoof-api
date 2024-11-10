import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  TryCatchAsyncDec,
  validateBodyMiddleware,
} from "@dolphjs/dolph/common";
import {
  Delete,
  Get,
  Post,
  Route,
  UseMiddleware,
} from "@dolphjs/dolph/decorators";
import { AccountService } from "./account.service";
import {
  CreateAccountDto,
  ForgetPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RequestOtpDto,
  ResetPasswordDto,
  UpdatePasswordDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from "./account.dto";
import { AuthShield } from "@/shared/shields";
import { sterilizeAccount } from "./account.sterializer";
import { WalletService } from "../wallet/wallet.service";
import { LoginMode } from "./account.enum";
import { IAccount } from "./account.model";
import { MtnMnoService } from "../mnos/mtn/mtn.mnos.service";

@Route("account")
export class AccountController extends DolphControllerHandler<Dolph> {
  private AccountService: AccountService;
  private WalletService: WalletService;
  private MtnMnoService: MtnMnoService;

  @Get("greet")
  async greet(req: DRequest, res: DResponse) {
    SuccessResponse({
      res,
      body: { message: "you've reached the account endpoint." },
    });
  }

  @Post("register")
  @UseMiddleware(validateBodyMiddleware(CreateAccountDto))
  @TryCatchAsyncDec
  async register(req: DRequest, res: DResponse) {
    const body: CreateAccountDto = req.body as CreateAccountDto;
    await this.AccountService.createAccount(body);

    await this.MtnMnoService.sendSms(req.body.phone, "Here is your OTP");

    SuccessResponse({ res, body: { msg: "Account Creation Successful" } });
  }

  @Post("verify")
  @UseMiddleware(validateBodyMiddleware(VerifyAccountDto))
  @TryCatchAsyncDec
  async verifyAccount(req: DRequest, res: DResponse) {
    const body: VerifyAccountDto = req.body as VerifyAccountDto;
    const data = await this.AccountService.verifyAccount(body);

    const { mno, paymentMethod } = await this.WalletService.createWallet({
      account: data.account._id.toString(),
      paymentMethod:
        data.account.loginMode === LoginMode.phone ? "mno" : "paystack",
    });

    SuccessResponse({
      res,
      body: {
        msg: "Account Verification Successful",
        data: { ...data, mno, paymentMethod },
      },
    });
  }

  @Post("send-otp")
  @UseMiddleware(validateBodyMiddleware(RequestOtpDto))
  @TryCatchAsyncDec
  async requestVerificationOtp(req: DRequest, res: DResponse) {
    const body: RequestOtpDto = req.body as RequestOtpDto;
    await this.AccountService.resendVerificationOtp(body);
    SuccessResponse({ res, body: { msg: "Otp sent" } });
  }

  @Post("request-password-reset")
  @UseMiddleware(validateBodyMiddleware(ForgetPasswordDto))
  @TryCatchAsyncDec
  async requestPasswordReset(req: DRequest, res: DResponse) {
    const body: ForgetPasswordDto = req.body as ForgetPasswordDto;

    await this.AccountService.requestResetPasswordReset(body);

    SuccessResponse({ res, body: { msg: "Otp sent" } });
  }

  @Post("password-reset")
  @UseMiddleware(validateBodyMiddleware(ResetPasswordDto))
  @TryCatchAsyncDec
  async resetPassword(req: DRequest, res: DResponse) {
    const body: ResetPasswordDto = req.body as ResetPasswordDto;

    const result = await this.AccountService.resetPassword(body);

    SuccessResponse({ res, body: result });
  }

  @Post("update/password")
  @UseMiddleware(AuthShield)
  @UseMiddleware(validateBodyMiddleware(UpdatePasswordDto))
  @TryCatchAsyncDec
  async updatePassword(req: DRequest, res: DResponse) {
    const body: UpdatePasswordDto = req.body as UpdatePasswordDto;
    const account: IAccount = req.payload.info as IAccount;

    await this.AccountService.updatePassword(body, account);

    SuccessResponse({ res, body: { msg: "Password updated successfully" } });
  }

  @Post("login")
  @UseMiddleware(validateBodyMiddleware(LoginDto))
  @TryCatchAsyncDec
  async login(req: DRequest, res: DResponse) {
    const data: LoginDto = req.body as LoginDto;
    const result = await this.AccountService.login(data);

    const { mno, paymentMethod } = await this.WalletService.getWallet(
      result.account._id.toString()
    );

    SuccessResponse({
      res,
      body: { ...result, mno, paymentMethod },
    });
  }

  @Post("verify-otp")
  @UseMiddleware(validateBodyMiddleware(VerifyOtpDto))
  @TryCatchAsyncDec
  async verifyOtp(req: DRequest, res: DResponse) {
    const data: VerifyOtpDto = req.body as VerifyOtpDto;
    const result = await this.AccountService.verifyOtp(data);

    const { mno, paymentMethod } = await this.WalletService.getWallet(
      result.account._id.toString()
    );

    SuccessResponse({
      res,
      body: { ...result, mno, paymentMethod },
    });
  }

  @Post("refresh-tokens")
  @UseMiddleware(validateBodyMiddleware(RefreshTokenDto))
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async refreshTokens(req: DRequest, res: DResponse) {
    const tokens = await this.AccountService.refreshTokens(
      req.body.token,
      req.payload.sub.toString()
    );

    SuccessResponse({ res, body: tokens });
  }

  @Get("")
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async getProfile(req: DRequest, res: DResponse) {
    const profile = await this.AccountService.getAccount({
      _id: req.payload.sub.toString(),
    });

    const { mno, paymentMethod } = await this.WalletService.getWallet(
      profile._id.toString()
    );

    SuccessResponse({
      res,
      body: {
        ...sterilizeAccount(profile),
        mno,
        paymentMethod,
      },
    });
  }

  @Post("logout")
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async logout(req: DRequest, res: DResponse) {
    // remove from token model
    req.payload = {} as any;

    SuccessResponse({
      res,
      body: { msg: "You have been logged out of the system" },
    });
  }

  @Delete()
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async deleteAccount(req: DRequest, res: DResponse) {
    // remove from token model
    const account: string = req.payload.sub as string;
    await this.WalletService.deleteWallet(account);
    await this.AccountService.deleteAccount(account);
    SuccessResponse({ res, body: { msg: "Account deletion successful" } });
  }

  @Post("reduce-coins/:coins")
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async reduceCoins(req: DRequest, res: DResponse) {
    const account = req.payload.info as IAccount;
    const coins = req.params.coins;

    if (account.coins !== 0) {
      if (account.coins - parseFloat(coins) < 0) {
        await this.AccountService.updateAccount(
          { email: account.email },
          { $inc: { coins: 0 } }
        );
      }

      await this.AccountService.updateAccount(
        { email: account.email },
        { $inc: { coins: -coins } }
      );
    }
    SuccessResponse({ res, body: { msg: "Coins deducted" } });
  }
}
