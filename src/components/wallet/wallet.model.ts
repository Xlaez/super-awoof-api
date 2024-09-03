import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";
import { MNO, mno } from "./wallet.enums";

export interface IWallet extends Document {
  account: string;
  balance: number;
  mno: string;
  createdAt: Date;
}

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
  },
  { timestamps: true, versionKey: false }
);

WalletSchema.plugin(mongoosePagination);

export const WalletModel: Pagination<IWallet> = model<
  IWallet,
  Pagination<IWallet>
>("wallets", WalletSchema);
