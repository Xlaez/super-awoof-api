import { Component } from "@dolphjs/dolph/decorators";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";
import { AccountService } from "../account/account.service";

@Component({
  controllers: [SystemController],
  services: [SystemService, AccountService],
})
export class SystemComponent {}
