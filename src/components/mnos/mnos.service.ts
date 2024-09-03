import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo} from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { MnosModel, IMnos } from "./mnos.model";


@InjectMongo("mnosModel", MnosModel)
export class MnosService extends DolphServiceHandler<Dolph> {
  mnosModel!: Model<IMnos>;

  constructor() {
    super("mnosservice");
  }
}
    
