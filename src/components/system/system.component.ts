import { Component } from "@dolphjs/dolph/decorators";
import { SystemController } from "./system.controller";
import { SystemService } from "./system.service";

@Component({ controllers: [SystemController], services: [SystemService] })
export class SystemComponent {}
