import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

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

export class EmailDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  descr: string;

  @IsString()
  @IsNotEmpty()
  body: string;
}
