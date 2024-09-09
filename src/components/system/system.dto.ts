import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class GetWinnersDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(["year", "month"])
  filter: string;
}

export class SaveWinnerDto {
  @IsNumber()
  amount: number;
}
