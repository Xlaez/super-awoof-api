import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { AccountModel, IAccount } from "./account.model";
import { Pagination } from "mongoose-paginate-ts";

@InjectMongo("accountModel", AccountModel)
export class AccountService extends DolphServiceHandler<Dolph> {
  accountModel!: Pagination<IAccount>;

  constructor() {
    super("accountservice");
  }
}
