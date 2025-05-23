import { ErrorException } from "@dolphjs/dolph/common";
import Joi from "joi";

const envSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .description("current app environment")
      .default("development"),

    JWT_SECRET_KEY: Joi.string()
      .description("JWT secret key")
      .default("secretkeyisverysecret"),

    JWT_ACCESS_EXPIRATION_DEV: Joi.string()
      .description("access duration")
      .default("200"),
    JWT_ACCESS_EXPIRATION_PROD: Joi.string()
      .description("access duration")
      .default("50"),
    JWT_REFRESH_EXPIRATION_DEV: Joi.string()
      .description("access duration")
      .default("1000"),
    JWT_REFRESH_EXPIRATION_PROD: Joi.string()
      .description("access duration")
      .default("800"),
    JWT_INVITE_EXPIRATION: Joi.string()
      .description("invite duration")
      .default("48"),
    SMTP_USER_DEV: Joi.string().description("SMTP dev username").required(),
    SMTP_PASS_DEV: Joi.string().description("SMTP dev password").required(),
    SMTP_SERVICE_DEV: Joi.string()
      .description("SMTP dev service")
      .default("gmail"),
    SMTP_USER_PROD: Joi.string().description("SMTP prod username"),
    SMTP_PASS_PROD: Joi.string().description("SMTP prod password"),
    SMTP_SERVICE_PROD: Joi.string().description("SMTP prod service"),
    MONGO_URL: Joi.string().description("MONGO Connection string").required(),
    SMS_API: Joi.string().description("API for SMS service"),
    MTN_CONSUMER_KEY: Joi.string().description("MTN Consumer Key"),
    MTN_CONSUMER_SECRET: Joi.string().description("MTN Consumer Secret"),
    CPID: Joi.string().description("Kitten router CPID").required(),
    XToken: Joi.string().description("Kitten router XToken").required(),
    APP_EMAIL: Joi.string()
      .description("App Email")
      .default("Flairtechhq@gmail.com"),
  })
  .unknown();

const { value: envVars, error } = envSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error)
  throw new ErrorException(`Configs Load Error: ${error.message}`, 500);

export default {
  env: envVars.NODE_ENV,
  jwt: {
    secret: envVars.JWT_SECRET_KEY,
    accessDuration:
      envVars.NODE_ENV === "development"
        ? envVars.JWT_ACCESS_EXPIRATION_DEV
        : envVars.JWT_ACCESS_EXPIRATION_PROD,
    refreshDuration:
      envVars.NODE_ENV === "development"
        ? envVars.JWT_REFRESH_EXPIRATION_DEV
        : envVars.JWT_REFRESH_EXPIRATION_PROD,
    inviteDuration: envVars.JWT_INVITE_EXPIRATION,
  },
  smtp: {
    service:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_SERVICE_DEV
        : envVars.SMTP_SERVICE_PROD,
    user:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_USER_DEV
        : envVars.SMTP_USER_PROD,
    pass:
      envVars.NODE_ENV === "development"
        ? envVars.SMTP_PASS_DEV
        : envVars.SMTP_PASS_PROD,
  },
  paystack: {
    secretKey:
      envVars.NODE_ENV === "development"
        ? envVars.PAYSTACK_SECRET_KEY_DEV
        : envVars.PAYSTACK_SECRET_KEY_PROD,
    publicKey:
      envVars.NODE_ENV === "production"
        ? envVars.PAYSTACK_PUBLIC_KEY_DEV
        : envVars.PAYSTACK_PUBLIC_KEY_PROD,
  },
  mongo: {
    url: envVars.MONGO_URL,
  },
  sms: {
    api: envVars.SMS_API,
  },
  mnos: {
    mtn: {
      cpid: envVars.CPID,
      xtoken: envVars.XToken,
    },
  },
  app: {
    email: envVars.APP_EMAIL,
  },
};
