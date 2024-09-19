import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  validateBodyMiddleware,
  TryCatchAsyncDec,
  validateParamMiddleware,
} from "@dolphjs/dolph/common";
import { Get, Post, Route, UseMiddleware } from "@dolphjs/dolph/decorators";
import { PaystackService } from "./paystack.service";
import { FundWallet, VerifyPaymentDto } from "./wallet.dto";
import { IAccount } from "../account/account.model";
import { AuthShield } from "@/shared/shields";

@Route("wallet")
export class WalletController extends DolphControllerHandler<Dolph> {
  private PaystackService: PaystackService;

  @Post("fund")
  @UseMiddleware(AuthShield)
  @UseMiddleware(validateBodyMiddleware(FundWallet))
  @TryCatchAsyncDec
  async fund(req: DRequest, res: DResponse) {
    const body: FundWallet = req.body;
    const account: IAccount = req.payload.info as IAccount;

    const result = await this.PaystackService.initialize({
      amount: body.amount * 100,
      email: account.email,
    });

    SuccessResponse({ res, body: result });
  }

  @Get("verify/:reference")
  @UseMiddleware(AuthShield)
  // @UseMiddleware(validateParamMiddleware(VerifyPaymentDto))
  @TryCatchAsyncDec
  async verify(req: DRequest, res: DResponse) {
    const result = await this.PaystackService.verifyPayment(
      req.params.reference
    );

    const data = await this.PaystackService.confirmPayment(result);

    SuccessResponse({ res, body: data });
  }
}
