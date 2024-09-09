import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { WalletModel, IWallet, IHistory, HistoryModel } from "./wallet.model";
import { Pagination } from "mongoose-paginate-ts";

@InjectMongo("walletModel", WalletModel)
@InjectMongo("historyModel", HistoryModel)
export class WalletService extends DolphServiceHandler<Dolph> {
  walletModel!: Pagination<IWallet>;
  historyModel!: Pagination<IHistory>;

  constructor() {
    super("walletservice");
  }

  async createWallet(dto: { account: string; paymentMethod: string }) {
    return this.walletModel.create(dto);
  }

  async getWallet(accountId: string) {
    return this.walletModel.findOne({ account: accountId });
  }

  async deleteWallet(accountId: string) {
    return this.walletModel.deleteOne({ account: accountId });
  }
}
