import { Component } from "@dolphjs/dolph/decorators";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";
import { WalletService } from "../wallet/wallet.service";

@Component({
  controllers: [SystemController],
  services: [SystemService, WalletService],
})
export class SystemComponent {}
