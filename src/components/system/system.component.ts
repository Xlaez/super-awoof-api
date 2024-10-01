import { Component } from "@dolphjs/dolph/decorators";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";
import { WalletService } from "../wallet/wallet.service";
import { EmailService } from "@/shared/services/email.service";

@Component({
  controllers: [SystemController],
  services: [SystemService, WalletService, EmailService],
})
export class SystemComponent {}
