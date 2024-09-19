import { Component } from "@dolphjs/dolph/decorators";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";
import { PaystackService } from "./paystack.service";
import { AccountService } from "../account/account.service";

@Component({
  controllers: [WalletController],
  services: [WalletService, PaystackService, AccountService],
})
export class WalletComponent {}
