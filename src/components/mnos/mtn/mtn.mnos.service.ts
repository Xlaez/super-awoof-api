import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";

export class MtnMnoService extends DolphServiceHandler<Dolph> {
  
  constructor() {
    super("mtnmnoservice");
  }
}
