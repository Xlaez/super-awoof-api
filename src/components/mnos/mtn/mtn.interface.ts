export interface ICallback {
  UpdateType: UpdateType;
}

export type UpdateType =
  | "Addition"
  | "Modification"
  | "Grace"
  | "Parked"
  | "Charged"
  | "Deletion";

export interface ICallbackData {
  action: UpdateType;
  msisdn: string;
  subid: string;
  pcode: string;
  amount: number | null;
  expirydate: Date | null;
  requestdate: Date | null;
  cptransid: string;
}

export interface IUssdRequestData {
  msgid: string;
  receiverid: string;
  senderid: string;
  msgtext: string;
  netcode: string;
}

export interface ISmsRequestData {
  msgid: string;
  shortcode: string;
  msisdn: string;
  msgtext: string;
  isdlr: any;
  timestamp: Date | null;
  netcode: string;
}
