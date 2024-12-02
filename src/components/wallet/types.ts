export type InitSuccessResponse = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

type Authorization = {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string | null;
};

type Customer = {
  id: number;
  first_name: string | null;
  last_name: string | null;
  email: string;
  customer_code: string;
  phone: string | null;
  metadata: any | null;
  risk_action: string;
  international_format_phone: string | null;
};

type Source = {
  type: string;
  source: string;
  entry_point: string;
  identifier: string | null;
};

export type IPaystackWebhookData = {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string | null;
  fees_breakdown: any | null;
  log: any | null;
  fees: number;
  fees_split: any | null;
  authorization: Authorization;
  customer: Customer;
  plan: Record<string, any>;
  subaccount: Record<string, any>;
  split: Record<string, any>;
  order_id: string | null;
  paidAt: string;
  requested_amount: number;
  pos_transaction_data: any | null;
  source: Source;
};

export type IPaystackCreateCustomer = {
  email?: string;
  first_name: string;
  last_name: string;
  phone?: string;
};
