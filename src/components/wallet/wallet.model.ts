import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";
import { HistoryType, historyType, MNO, mno } from "./wallet.enums";

export interface IWallet extends Document {
  account: string;
  balance: number;
  mno: string;
  createdAt: Date;
  paymentMethod: string;
}

export interface IHistory extends Document {
  account: string;
  paymentMethod: string;
  amount: number;
  reference: string;
  type: string;
  createdAt: Date;
}

const HistorySchema = new Schema(
  {
    account: {
      type: Types.ObjectId,
      ref: "history",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: "mno",
      enum: ["mno", "paystack"],
    },
    reference: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: historyType,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const WalletSchema = new Schema(
  {
    account: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
    mno: {
      type: String,
      enum: mno,
      default: MNO.MTN,
    },
    paymentMethod: {
      type: String,
      default: "mno",
      enum: ["mno", "paystack"],
    },
  },
  { timestamps: true, versionKey: false }
);

WalletSchema.plugin(mongoosePagination);
HistorySchema.plugin(mongoosePagination);

export const HistoryModel: Pagination<IHistory> = model<
  IHistory,
  Pagination<IHistory>
>("histories", HistorySchema);

export const WalletModel: Pagination<IWallet> = model<
  IWallet,
  Pagination<IWallet>
>("wallets", WalletSchema);
