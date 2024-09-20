import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import {
  WalletModel,
  IWallet,
  IHistory,
  HistoryModel,
  IWithdrawalRecord,
  WithdrawalRecordModel,
} from "./wallet.model";
import { Pagination } from "mongoose-paginate-ts";
import { CreateRecordDto, HistoryDto } from "./wallet.dto";

@InjectMongo("walletModel", WalletModel)
@InjectMongo("historyModel", HistoryModel)
@InjectMongo("recordModel", WithdrawalRecordModel)
export class WalletService extends DolphServiceHandler<Dolph> {
  walletModel!: Pagination<IWallet>;
  historyModel!: Pagination<IHistory>;
  recordModel!: Pagination<IWithdrawalRecord>;

  constructor() {
    super("walletservice");
  }

  async createWallet(dto: {
    account: string;
    paymentMethod: string;
    balance?: number;
  }) {
    return this.walletModel.create(dto);
  }

  async getWallet(accountId: string) {
    return this.walletModel.findOne({ account: accountId });
  }

  async deleteWallet(accountId: string) {
    return this.walletModel.deleteOne({ account: accountId });
  }

  async createHistory(data: HistoryDto) {
    return this.historyModel.create(data);
  }

  async getHistoryByReference(reference: string) {
    return this.historyModel.findOne({ reference });
  }

  async updateWallet(filter: any, updateObj: any) {
    return this.walletModel.findOneAndUpdate(filter, updateObj);
  }

  async createRecord(data: CreateRecordDto) {
    return this.recordModel.create(data);
  }
}
