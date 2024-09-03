import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo} from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { WalletModel, IWallet } from "./wallet.model";


@InjectMongo("walletModel", WalletModel)
export class WalletService extends DolphServiceHandler<Dolph> {
  walletModel!: Model<IWallet>;

  constructor() {
    super("walletservice");
  }
}
    
