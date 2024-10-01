import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IWinner extends Document {
  account: string;
  amount: number;
  createdAt: Date;
}

export interface ISubscription extends Document {
  cptransid: string;
  amount: number;
  pcode: string;
  msisdn: string;
  action: string;
  expirydate: Date;
  requestdate: Date;
}

const WinnerSchema = new Schema(
  {
    account: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

const SubscriptionSchema = new Schema(
  {
    cptransid: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    pcode: {
      type: String,
      required: false,
    },
    msisdn: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    expirydate: {
      type: Date,
      required: true,
    },
    requestdate: {
      type: Date,
      required: true,
    },
  },
  { versionKey: false }
);

WinnerSchema.plugin(mongoosePagination);
SubscriptionSchema.plugin(mongoosePagination);

export const WinnerModel: Pagination<IWinner> = model<
  IWinner,
  Pagination<IWinner>
>("winners", WinnerSchema);

export const SubscriptionModel: Pagination<ISubscription> = model<
  ISubscription,
  Pagination<ISubscription>
>("subscription", SubscriptionSchema);
