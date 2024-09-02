import { Schema, Document, model } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IAccount extends Document {
  email: string;
  password: string;
  phone: string;
  isVerified: boolean;
}

const AccountSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, versionKey: false }
);

AccountSchema.plugin(mongoosePagination);

export const AccountModel: Pagination<IAccount> = model<
  IAccount,
  Pagination<IAccount>
>("accounts", AccountSchema);
