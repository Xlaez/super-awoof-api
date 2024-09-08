import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  TryCatchAsyncDec,
  validateBodyMiddleware,
} from "@dolphjs/dolph/common";
import { Get, Post, Route, UseMiddleware } from "@dolphjs/dolph/decorators";
import { AccountService } from "./account.service";
import {
  CreateAccountDto,
  LoginDto,
  RequestOtpDto,
  VerifyAccountDto,
  VerifyOtpDto,
} from "./account.dto";

@Route("account")
export class AccountController extends DolphControllerHandler<Dolph> {
  private AccountService: AccountService;
  constructor() {
    super();
  }

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
    SuccessResponse({ res, body: { msg: "Account Creation Successful" } });
  }

  @Post("verify")
  @UseMiddleware(validateBodyMiddleware(VerifyAccountDto))
  @TryCatchAsyncDec
  async verifyAccount(req: DRequest, res: DResponse) {
    const body: VerifyAccountDto = req.body as VerifyAccountDto;
    const data = await this.AccountService.verifyAccount(body);
    SuccessResponse({
      res,
      body: { msg: "Account Verification Successful", data },
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

  @Post("login")
  @UseMiddleware(validateBodyMiddleware(LoginDto))
  @TryCatchAsyncDec
  async login(req: DRequest, res: DResponse) {
    const data: LoginDto = req.body as LoginDto;
    const result = await this.AccountService.login(data);
    SuccessResponse({ res, body: result });
  }

  @Post("verify-otp")
  @UseMiddleware(validateBodyMiddleware(VerifyOtpDto))
  @TryCatchAsyncDec
  async verifyOtp(req: DRequest, res: DResponse) {
    const data: VerifyOtpDto = req.body as VerifyOtpDto;
    const result = await this.AccountService.verifyOtp(data);
    SuccessResponse({ res, body: result });
  }
}
