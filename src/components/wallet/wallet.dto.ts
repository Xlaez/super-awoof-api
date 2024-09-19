import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class HistoryDto {
  @IsString()
  @IsNotEmpty()
  account: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reference: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class FundWallet {
  @Type(() => Number)
  amount: number;
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  reference: string;
}
