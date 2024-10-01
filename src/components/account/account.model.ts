import { Model, Types } from "mongoose";
import { Schema, Document, model } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";
import { Subscription, subscription } from "./account.enum";

export interface IAccount extends Document {
  email: string;
  phone: string;
  coins: number;
  fullname: string;
  password: string;
  loginMode: string;
  isVerified: boolean;
  subscription: string;
  endOfSubscription: Date;
}

const AccountSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    loginMode: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    coins: {
      type: Number,
      default: 0,
    },
    subscription: {
      type: String,
      enum: subscription,
      default: Subscription.none,
    },
    endOfSubscription: {
      type: Date,
    },
  },
  { timestamps: true, versionKey: false }
);

AccountSchema.plugin(mongoosePagination);

export interface IOtp extends Document {
  otp: string;
  expires: Date;
  accountId: string;
}

const OtpSchema = new Schema(
  {
    otp: {
      type: String,
      required: false,
      minlength: 4,
      maxlength: 4,
    },
    expires: {
      type: Date,
      required: true,
    },
    accountId: {
      type: Types.ObjectId,
      ref: "accounts",
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

OtpSchema.index({ otp: 1 }, { background: true });
AccountSchema.index({ phone: 1 }, { background: true });
AccountSchema.index({ email: 1 }, { background: true });
AccountSchema.index({ subscription: 1 }, { background: true });

export const OtpModel: Model<IOtp> = model<IOtp>("otps", OtpSchema);

export const AccountModel: Pagination<IAccount> = model<
  IAccount,
  Pagination<IAccount>
>("accounts", AccountSchema);
