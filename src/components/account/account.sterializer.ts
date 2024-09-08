import { IAccount } from "./account.model";

export const sterilizeAccount = (account: IAccount) => {
  let data = account;

  data.password = null;

  return data.toObject();
};

export const sterilizeAccounts = (accounts: IAccount[]) => {
  const data = [];
  for (const account of accounts) {
    data.push(sterilizeAccount(account));
  }

  return data;
};
