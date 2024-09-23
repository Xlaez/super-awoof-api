import envConfigs from "@/shared/configs/env.configs";
import { postRequest } from "@/shared/helpers/api_utils.helper";
import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";

export class MtnMnoService extends DolphServiceHandler<Dolph> {
  private url = "http://89.107.62.249:8101/";
  private cpid: string;
  private xtoken: string;
  constructor() {
    super("mtnmnoservice");
    this.cpid = envConfigs.mnos.mtn.cpid;
    this.xtoken = envConfigs.mnos.mtn.xtoken;
  }

  async sendSms(phone: number, text: string) {
    const endpoint = `${this.url}jsdp/sms/moresp/push?sender=4554&dest=${phone}&msgtext=${text}&pcode=MTN2`;

    const headers = {
      CPID: this.cpid,
      "X-Token": this.xtoken,
    };

    try {
      const request = (await postRequest({ endpoint, headers })) as any;

      const response = request.data
        ? request.data
        : new Error("An error occurred");

      console.log(response);

      return response;
    } catch (e: any) {
      throw e;
    }
  }

  async subscribe(phone: string) {
    const endpoint = `${this.url}jsdpocg/charge/OP/......?msisdn=${phone}&platform=SMS&pcode=productcode&amount=500&validity=30&ren=none`;

    try {
      const headers = {};

      const request = await postRequest({ endpoint, headers });

      const response = request.data;

      return response;
    } catch (e: any) {
      throw e;
    }
  }

  async unsubscribe(phone: number) {
    const endpoint = `${this.url}jsdpocg/charge/OP/......?msisdn=${phone}&platform=SMS&pcode=productcode&notifyurl=url`;

    const headers = {};
    try {
      const request = await postRequest({ endpoint, headers });

      const response = request.data;

      return response;
    } catch (e: any) {
      throw e;
    }
  }
}
