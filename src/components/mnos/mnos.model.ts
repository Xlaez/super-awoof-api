import { Schema, Document, model } from "mongoose";

export interface IMnos extends Document {
  
}

const MnosSchema = new Schema(
    {

    }
);

export const MnosModel = model<IMnos>("mnoss", MnosSchema);
