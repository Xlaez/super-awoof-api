import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @IsOptional()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
    {
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%?&)",
    }
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;
}

export class VerifyAccountDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class RequestOtpDto {
  @IsString()
  @IsNotEmpty()
  emailOrPhone: string;
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(20)
  @IsOptional()
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/,
    {
      message:
        "Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%?&)",
    }
  )
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  phone: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  otp: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
