export enum MNO {
  MTN = "mtn",
  AIRTEL = "airtel",
  GLO = "glo",
  ETISALAT = "9mobile",
}

export enum HistoryType {
  credit = "Credit",
  debit = "Debit",
}

export const mno = [MNO.AIRTEL, MNO.MTN, MNO.GLO, MNO.ETISALAT];

export const historyType = [HistoryType.credit, HistoryType.debit];
