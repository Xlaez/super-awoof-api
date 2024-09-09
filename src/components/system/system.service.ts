import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph, NotAcceptableException } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { IWinner, WinnerModel } from "./system.model";
import { Pagination } from "mongoose-paginate-ts";
import {
  endOfMonth,
  endOfYear,
  startOfMinute,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { AlgoLevel } from "./system.enum";

const MAX_WINNERS = 30;

@InjectMongo("winnerModel", WinnerModel)
export class SystemService extends DolphServiceHandler<Dolph> {
  winnerModel!: Pagination<IWinner>;

  constructor() {
    super("systemservice");
  }

  async saveWinner(accountId: string, amount: number) {
    await this.isEligibleToPlay(accountId);
    return this.winnerModel.create({ account: accountId, amount });
  }

  /**
   * Endpoint to check if user is eligible to play this month (i.e has not won this month)
   */

  async isEligibleToPlay(accountId: string) {
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    const existingWinner = await this.winnerModel
      .findOne({
        account: accountId,
        createdAt: {
          $gte: startOfCurrentMonth,
          $lte: endOfCurrentMonth,
        },
      })
      .exec();

    if (existingWinner)
      throw new NotAcceptableException(
        "You are already a winner for this month, you are not allowed to play again"
      );

    return;
  }

  /**
   * Endpoint to return all winners this month
   */

  async thisMonthsWinners() {
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    const existingWinners = await this.winnerModel
      .find({
        createdAt: {
          $gte: startOfCurrentMonth,
          $lte: endOfCurrentMonth,
        },
      })
      .populate("account", "fullname email phone createdAt")
      .exec();

    return existingWinners;
  }

  /**
   * Endpoint to return all winners for the year
   */

  async thisYearsWinners() {
    const startOfCurrentYear = startOfYear(new Date());
    const endOfCurrentYear = endOfYear(new Date());

    const existingWinners = await this.winnerModel
      .find({
        createdAt: {
          $gte: startOfCurrentYear,
          $lte: endOfCurrentYear,
        },
      })
      .populate("account", "fullname email phone createdAt")
      .exec();

    return existingWinners;
  }

  /**
   * Endpoint to tell the algorithm whether to get aggressive or not ["hard", "aggressive", "impossible"]
   */

  async algoLevel() {
    const startOfCurrentMonth = startOfMonth(new Date());
    const endOfCurrentMonth = endOfMonth(new Date());

    const existingWinners = await this.winnerModel
      .countDocuments({
        createdAt: {
          $gte: startOfCurrentMonth,
          $lte: endOfCurrentMonth,
        },
      })
      .exec();

    const half = MAX_WINNERS / 2;
    const twoThird = Math.floor(MAX_WINNERS * 0.667);

    if (existingWinners < half) {
      return AlgoLevel.hard;
    } else if (existingWinners > half && existingWinners < twoThird) {
      return AlgoLevel.aggressive;
    } else if (existingWinners === MAX_WINNERS) {
      return AlgoLevel.impossible;
    }
  }
}
