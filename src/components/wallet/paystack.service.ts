import envConfigs from "@/shared/configs/env.configs";
import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph } from "@dolphjs/dolph/common";
import { InitSuccessResponse } from "./types";
import {
  ICreateRecipient,
  IInitPaystackPayment,
  ITransferRecipient,
  ITransferToRecipient,
} from "./interfaces";
import { getRequest, postRequest } from "@/shared/helpers/api_utils.helper";

export class PaystackService extends DolphServiceHandler<Dolph> {
  private readonly secretKey: string;
  private readonly publicKey: string;
  protected readonly url: string;

  constructor() {
    super("paystack");
    this.secretKey = envConfigs.paystack.secretKey;
    this.publicKey = envConfigs.paystack.publicKey;
    this.url = "https://api.paystack.co";
  }

  public async initialize(
    data: IInitPaystackPayment
  ): Promise<InitSuccessResponse> {
    const endpoint = `${this.url}/transaction/initialize`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await postRequest({ endpoint, headers, data });

    return request.data.data as InitSuccessResponse;
  }

  public async verifyPayment(reference: string) {
    const endpoint = `${this.url}/transaction/verify/${reference}`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await getRequest({ endpoint, headers });

    return request.data.data;
  }

  public async sendMoney(data: ITransferRecipient) {
    const endpoint = `${this.url}/transferrecipient`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await postRequest({ endpoint, headers, data });
    return request.data;
  }

  public async listOfBanks() {
    const endpoint = `${this.url}/bank?currency=NGN`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await getRequest({ endpoint, headers });

    return request.data.data;
  }

  public async createRecipient(data: ICreateRecipient) {
    const endpoint = `${this.url}/transferrecipient`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await postRequest({ endpoint, headers, data });

    console.log(request);

    return request.data;
  }

  public async transferToRecipient(data: ITransferToRecipient) {
    const endpoint = `${this.url}/transfer`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await postRequest({ endpoint, headers, data });

    console.log(request);

    return request.data;
  }
}
