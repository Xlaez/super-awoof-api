import { Schema, Document, model, Types } from "mongoose";
import { mongoosePagination, Pagination } from "mongoose-paginate-ts";

export interface IWinner extends Document {
  account: string;
  amount: number;
  createdAt: Date;
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

WinnerSchema.plugin(mongoosePagination);

export const WinnerModel: Pagination<IWinner> = model<
  IWinner,
  Pagination<IWinner>
>("winners", WinnerSchema);
