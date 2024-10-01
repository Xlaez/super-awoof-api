import envConfigs from "@/shared/configs/env.configs";
import { postRequest } from "@/shared/helpers/api_utils.helper";
import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { ICallbackData } from "./mtn.interface";
import { AccountService } from "@/components/account/account.service";
import { Subscription } from "@/components/account/account.enum";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import {
  ISubscription,
  SubscriptionModel,
} from "@/components/system/system.model";
import { Pagination } from "mongoose-paginate-ts";

const accountService = new AccountService();

@InjectMongo("subscriptionModel", SubscriptionModel)
export class MtnMnoService extends DolphServiceHandler<Dolph> {
  private url = "http://89.107.62.249:8101/";
  private cpid: string;
  private xtoken: string;

  private subscriptionModel!: Pagination<ISubscription>;
  constructor() {
    super("mtnmnoservice");
    this.cpid = envConfigs.mnos.mtn.cpid;
    this.xtoken = envConfigs.mnos.mtn.xtoken;
  }

  async sendSms(phone: number, text: string) {
    const endpoint = `${this.url}jsdp/sms/moresp/push?sender=20138&dest=${phone}&msgtext=${text}&pcode=2223`;

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

  async billingSync(data: ICallbackData) {
    console.log(`=== callback data ====`);
    console.log(data);
    console.log(`=== callback data ====`);

    const account = await accountService.getAccountByPhone(data.msisdn);

    await this.subscriptionModel.create({
      pcode: data.pcode,
      cptransid: data.cptransid,
      amount: data.amount,
      action: data.action,
      expirydate: data.expirydate,
      requestdate: data.requestdate,
      msisdn: data.msisdn,
    });

    if (data.action === "Deletion") {
      account.subscription = Subscription.none;
      account.endOfSubscription = new Date();
    }

    if (data.action === "Modification" || data.action === "Addition") {
      if (data.amount === 100) {
        account.subscription = Subscription.daily;
        account.coins += 5;
        account.endOfSubscription = data.expirydate;
      }

      if (data.amount === 300) {
        account.subscription = Subscription.weekly;
        account.coins += 20;
        account.endOfSubscription = data.expirydate;
      }

      if (data.amount === 500) {
        account.subscription = Subscription.monthly;
        account.coins += 50;
        account.endOfSubscription = data.expirydate;
      }
    }

    account.save();

    // use data to do something
    return { status: true, message: "Bill Sync Ok" };
  }
}
