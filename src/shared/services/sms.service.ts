import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import envConfigs from "../configs/env.configs";
import { ISMS } from "./interface";
import { URLSearchParams } from "node:url";

export class SmsService extends DolphServiceHandler<Dolph> {
  private url: string = "https://api.releans.com/v2/message";
  private apiKey: string;
  constructor() {
    super("smsservice");
    this.apiKey = envConfigs.sms.api;
  }

  public async sendSms(data: ISMS) {
    const body = new URLSearchParams({ ...data }).toString();

    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (e: any) {
      console.error(e);
      throw new Error(`Error: ${e}`);
    }
  }
}
