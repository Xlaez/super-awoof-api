import { Component } from "@dolphjs/dolph/decorators";
import { MtnMnoService } from "./mtn.mnos.service";
import { MtnMnoController } from "./mtn.mnos.controller";

@Component({ services: [MtnMnoService], controllers: [MtnMnoController] })
export class MtnMnoComponent {}
