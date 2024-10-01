import { DolphControllerHandler } from "@dolphjs/dolph/classes";
import {
  Dolph,
  DRequest,
  DResponse,
  SuccessResponse,
  TryCatchAsyncDec,
} from "@dolphjs/dolph/common";
import { Get, Route } from "@dolphjs/dolph/decorators";
import { MtnMnoService } from "./mtn.mnos.service";
import { ICallbackData } from "./mtn.interface";

@Route("mno")
export class MtnMnoController extends DolphControllerHandler<Dolph> {
  MtnMnoService: MtnMnoService;

  @Get("billing/callback")
  @TryCatchAsyncDec
  async billingCallback(req: DRequest, res: DResponse) {
    console.log(req.query);
    const data: ICallbackData = req.query as any;
    const response = await this.MtnMnoService.billingSync(data);

    SuccessResponse({ res, body: response });
  }
}
