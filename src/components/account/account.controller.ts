import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  TryCatchAsyncDec,
} from "@dolphjs/dolph/common";
import { Get, Post, Route } from "@dolphjs/dolph/decorators";
import { AccountService } from "./account.service";

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
  @TryCatchAsyncDec
  async register(req: DRequest, res: DResponse) {
    const result = await this.AccountService.createAccount();

    SuccessResponse({ res, body: result });
  }
}
