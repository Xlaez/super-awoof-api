import { Component } from "@dolphjs/dolph/decorators";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { WalletService } from "../wallet/wallet.service";

@Component({
  controllers: [AccountController],
  services: [AccountService, WalletService],
})
export class AccountComponent {}
