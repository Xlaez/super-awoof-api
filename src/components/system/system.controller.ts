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
import { GetWinnersDto, SaveWinnerDto } from "./system.dto";
import { IWinner } from "./system.model";
import { AuthShield } from "@/shared/shields";
import { IAccount } from "../account/account.model";

@Route("system")
export class SystemController extends DolphControllerHandler<Dolph> {
  private SystemService: SystemService;
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

    SuccessResponse({ res, body: { msg: "You won!" } });
  }

  @Get("greet")
  async greet(req: DRequest, res: DResponse) {
    SuccessResponse({
      res,
      body: { message: "you've reached the system endpoint." },
    });
  }
}
