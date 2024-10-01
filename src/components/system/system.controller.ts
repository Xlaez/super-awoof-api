import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  SuccessResponse,
  DRequest,
  DResponse,
  TryCatchAsyncDec,
  validateQueryMiddleware,
  HttpStatus,
  validateBodyMiddleware,
} from "@dolphjs/dolph/common";
import { Get, Post, Route, UseMiddleware } from "@dolphjs/dolph/decorators";
import { SystemService } from "./system.service";
import { EmailDto, GetWinnersDto, SaveWinnerDto } from "./system.dto";
import { IWinner } from "./system.model";
import { AuthShield } from "@/shared/shields";
import { sterilizeAccount } from "../account/account.sterializer";
import { WalletService } from "../wallet/wallet.service";
import { EmailService } from "@/shared/services/email.service";
import { IAccount } from "../account/account.model";

@Route("system")
export class SystemController extends DolphControllerHandler<Dolph> {
  private SystemService: SystemService;
  private WalletService: WalletService;
  private EmailService: EmailService;
  constructor() {
    super();
  }

  // add a middleware here that only the system can have access to  by using a private key
  @Get("algo-level")
  @TryCatchAsyncDec
  async algoLevel(req: DRequest, res: DResponse) {
    const result = await this.SystemService.algoLevel();

    SuccessResponse({ res, body: { msg: "hard" } });
  }

  @Get("winners")
  @UseMiddleware(validateQueryMiddleware(GetWinnersDto))
  @TryCatchAsyncDec
  async winners(req: DRequest, res: DResponse) {
    const filter = req.query.filter as string;

    let winners: IWinner[];

    if (filter === "year") {
      winners = await this.SystemService.thisYearsWinners();
    } else if (filter === "month") {
      winners = await this.SystemService.thisMonthsWinners();
    }

    SuccessResponse({ res, body: winners });
  }

  @Get("eligibility")
  @UseMiddleware(AuthShield)
  @TryCatchAsyncDec
  async checkEligibility(req: DRequest, res: DResponse) {
    const account: string = req.payload.sub as string;

    await this.SystemService.isEligibleToPlay(account);

    SuccessResponse({ res, status: HttpStatus.ACCEPTED });
  }

  @Post("winner")
  @UseMiddleware(AuthShield)
  @UseMiddleware(validateBodyMiddleware(SaveWinnerDto))
  @TryCatchAsyncDec
  async saveWinner(req: DRequest, res: DResponse) {
    const account: string = req.payload.sub as string;

    await this.SystemService.saveWinner(account, req.body.amount);

    // const updatedAccount = await this.WalletService.updateWallet(
    //   { account: account },
    //   { $inc: { balance: req.body.amount } }
    // );

    SuccessResponse({
      res,
      body: { msg: "You won!" },
    });
  }

  @Post("email-send")
  @UseMiddleware(AuthShield)
  @UseMiddleware(validateBodyMiddleware(EmailDto))
  @TryCatchAsyncDec
  async sendEmail(req: DRequest, res: DResponse) {
    const { body, descr, title } = req.body as EmailDto;

    const account: IAccount = req.payload.info as IAccount;

    await this.EmailService.sendEmailToIllumi8Mail(
      account.email,
      title,
      body,
      descr
    );

    SuccessResponse({ res, body: { msg: "Email Sent successfully" } });
  }
}
