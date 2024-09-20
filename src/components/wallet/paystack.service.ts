import envConfigs from "@/shared/configs/env.configs";
import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import {
  BadRequestException,
  Dolph,
  InternalServerErrorException,
  NotAcceptableException,
  NotFoundException,
} from "@dolphjs/dolph/common";
import { InitSuccessResponse } from "./types";
import {
  ICreateRecipient,
  IInitPaystackPayment,
  IPaystackWebhookData,
  ITransferRecipient,
  ITransferToRecipient,
} from "./interfaces";
import { getRequest, postRequest } from "@/shared/helpers/api_utils.helper";
import { AccountService } from "../account/account.service";
import { WalletService } from "./wallet.service";
import { HistoryType } from "./wallet.enums";

export class PaystackService extends DolphServiceHandler<Dolph> {
  private readonly secretKey: string;
  private readonly publicKey: string;
  protected readonly url: string;
  private AccountService: AccountService;
  private WalletService: WalletService;

  constructor() {
    super("paystack");
    this.secretKey = envConfigs.paystack.secretKey;
    this.publicKey = envConfigs.paystack.publicKey;
    this.url = "https://api.paystack.co";
    this.AccountService = new AccountService();
    this.WalletService = new WalletService();
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

    console.log(request.data);

    return request.data;
  }

  public async confirmAccountNo(accountno: string, bankcode: string) {
    const endpoint = `${this.url}/bank/resolve?account_number=${accountno}&bank_code=${bankcode}`;

    const headers = {
      Authorization: `Bearer ${this.secretKey}`,
    };

    const request = await getRequest({ endpoint, headers });

    console.log(request.data);

    return request.data;
  }

  public async confirmPayment(data: IPaystackWebhookData) {
    const account = await this.AccountService.getAccount({
      email: data.customer.email,
    });

    if (account) {
      if (data.status === "success") {
        const amount = data.amount / 100;

        if (await this.WalletService.getHistoryByReference(data.reference))
          throw new NotAcceptableException(
            "This payment has already been verified and recorded"
          );

        const history = await this.WalletService.createHistory({
          account: account._id.toString(),
          paymentMethod: "paystack",
          reference: data.reference,
          type: HistoryType.credit,
          amount,
        });

        if (!history)
          throw new InternalServerErrorException("Cannot record payment");

        let wallet = await this.WalletService.getWallet(account._id.toString());

        if (!wallet) {
          await this.WalletService.createWallet({
            account: account._id.toString(),
            paymentMethod: "paystack",
            balance: amount,
          });
        }

        wallet.balance += amount;
        await wallet.save();
      } else if (
        data.status === "pending" ||
        data.status === "processing" ||
        data.status === "ongoing"
      ) {
        return "Transaction pending";
      } else if (data.status === "reversed") {
        throw new BadRequestException(
          "Payment not successful, the money was reversed back to source bank account"
        );
      } else {
        throw new BadRequestException("Payment was abandoned or not completed");
      }

      return "success";
    }

    throw new NotFoundException("Account not found");
  }
}
