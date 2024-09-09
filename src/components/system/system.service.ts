import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph, NotAcceptableException } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { IWinner, WinnerModel } from "./system.model";
import { Pagination } from "mongoose-paginate-ts";
import { endOfMonth, startOfMinute, startOfMonth } from "date-fns";

@InjectMongo("winnerModel", WinnerModel)
export class SystemService extends DolphServiceHandler<Dolph> {
  winnerModel!: Pagination<IWinner>;

  constructor() {
    super("systemservice");
  }

  async saveWinner(accountId: string, amount: number) {
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

  /**
   * Endpoint to return all winners for the year
   */

  /**
   * Endpoint to tell the algorithm whether to get aggressive or not ["hard", "aggressive", "impossible"]
   */
}
