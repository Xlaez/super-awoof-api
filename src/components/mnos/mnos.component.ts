import { Component } from "@dolphjs/dolph/decorators";
import { MnosController } from "./mnos.controller";
import { MnosService } from "./mnos.service";

@Component({ controllers: [MnosController], services: [MnosService] })
export class MnosComponent {}
