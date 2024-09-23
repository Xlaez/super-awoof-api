import { Component } from "@dolphjs/dolph/decorators";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { WalletService } from "../wallet/wallet.service";
import { MtnMnoService } from "../mnos/mtn/mtn.mnos.service";

@Component({
  controllers: [AccountController],
  services: [AccountService, WalletService, MtnMnoService],
})
export class AccountComponent {}
