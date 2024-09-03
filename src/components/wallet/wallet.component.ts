import { Component } from "@dolphjs/dolph/decorators";
import { WalletController } from "./wallet.controller";
import { WalletService } from "./wallet.service";

@Component({ controllers: [WalletController], services: [WalletService] })
export class WalletComponent {}
