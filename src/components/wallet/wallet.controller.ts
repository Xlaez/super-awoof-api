import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  validateBodyMiddleware,
  TryCatchAsyncDec,
  validateParamMiddleware,
  BadRequestException,
  NotFoundException,
} from "@dolphjs/dolph/common";
import {
  Get,
  Post,
  Route,
  Shield,
  UseMiddleware,
} from "@dolphjs/dolph/decorators";
import { PaystackService } from "./paystack.service";
import { FundWallet, VerifyPaymentDto, WithdrawDto } from "./wallet.dto";
import { IAccount } from "../account/account.model";
import { AuthShield } from "@/shared/shields";
import { generateUUIDv4 } from "@/shared/helpers/uuid_generator.helper";
import { ITransferToRecipient } from "./interfaces";
import { WalletService } from "./wallet.service";

@Route("wallet")
@Shield(AuthShield)
export class WalletController extends DolphControllerHandler<Dolph> {
  private PaystackService: PaystackService;
  private WalletService: WalletService;

  @Post("fund")
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
  @TryCatchAsyncDec
  async verify(req: DRequest, res: DResponse) {
    const result = await this.PaystackService.verifyPayment(
      req.params.reference
    );

    const data = await this.PaystackService.confirmPayment(result);

    SuccessResponse({ res, body: data });
  }

  @Post("withdraw")
  @UseMiddleware(validateBodyMiddleware(WithdrawDto))
  @TryCatchAsyncDec
  async withdraw(req: DRequest, res: DResponse) {
    const account: IAccount = req.payload.info;
    const body: WithdrawDto = req.body as WithdrawDto;

    const wallet = await this.WalletService.getWallet(account.id);

    if (!wallet) throw new NotFoundException("User does not have a wallet.");

    if (wallet.balance < body.amount)
      throw new BadRequestException(
        "Cannot withdraw more than what is your wallet"
      );

    const result = await this.PaystackService.createRecipient({
      account_number: body.accountNo,
      currency: "NGN",
      name: body.bankName,
      type: "nuban",
      bank_code: body.bankCode,
    });

    const reference = generateUUIDv4();

    const tranferData: ITransferToRecipient = {
      amount: body.amount * 100,
      reason: "Super-Awoof withdrawal",
      recipient: result.data.recipient_code,
      source: "balance",
      reference,
    };

    const withdrawalResult = await this.PaystackService.transferToRecipient(
      tranferData
    );

    await Promise.all([
      this.WalletService.updateWallet(
        { account: account._id },
        { $inc: { balance: -body.amount } }
      ),

      this.WalletService.createRecord({
        account: account._id.toString(),
        accountName: body.accountName,
        accountNo: body.accountNo,
        amount: body.amount,
        bankName: body.bankName,
      }),
    ]);

    SuccessResponse({ res, body: withdrawalResult });
  }

  @Get("banks")
  @TryCatchAsyncDec
  async getBanks(req: DRequest, res: DResponse) {
    const banks = await this.PaystackService.listOfBanks();
    SuccessResponse({ res, body: banks });
  }

  @Get("confirm-account")
  @TryCatchAsyncDec
  async confirmAccountNo(req: DRequest, res: DResponse) {
    const result = await this.PaystackService.confirmAccountNo(
      req.query.accountNo.toString(),
      req.query.bankCode.toString()
    );

    SuccessResponse({ res, body: result });
  }

  @Get()
  @TryCatchAsyncDec
  async getWallet(req: DRequest, res: DResponse) {
    const account: IAccount = req.payload.info;
    const wallet = await this.WalletService.getWallet(account._id.toString());

    SuccessResponse({ res, body: wallet });
  }
}
