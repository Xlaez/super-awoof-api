import { DolphServiceHandler } from "@dolphjs/dolph/classes";
import { Dolph, IPayload, UnauthorizedException } from "@dolphjs/dolph/common";
import { InjectMongo } from "@dolphjs/dolph/decorators";
import { Model } from "mongoose";
import { TokenModel, IToken } from "./token.model";
import envConfigs from "@/shared/configs/env.configs";
import moment from "moment";
import {
  generateJWTwithHMAC,
  verifyJWTwithHMAC,
} from "@dolphjs/dolph/utilities";

@InjectMongo("tokenModel", TokenModel)
export class TokenService extends DolphServiceHandler<Dolph> {
  tokenModel!: Model<IToken>;

  constructor() {
    super("tokenservice");
  }

  public async generateToken(userId: string) {
    const accessDuration = +envConfigs.jwt.accessDuration;
    const refreshDuration = +envConfigs.jwt.refreshDuration;

    const accessToken = this.signToken(
      userId,
      moment().add(accessDuration, "minutes")
    );
    const refreshToken = this.signToken(
      userId,
      moment().add(refreshDuration, "minutes")
    );

    const accessExpiration = moment().add(accessDuration, "minutes");

    const refreshExpiration = moment().add(refreshDuration, "minutes");

    await this.tokenModel.create({
      token: refreshToken,
      expires: refreshExpiration.toISOString(),
      type: "refresh",
      accountId: userId,
    });

    return {
      accessToken,
      refreshToken,
      accessExpiration,
      refreshExpiration,
    };
  }

  public async verifyRefreshToken(token: string) {
    const refreshToken = await this.tokenModel.findOne({
      token,
      type: "refresh",
    });

    if (!refreshToken)
      throw new UnauthorizedException("Cannot refresh user session");

    const refreshTokenDoc = await verifyJWTwithHMAC({
      token: refreshToken.token,
      secret: envConfigs.jwt.secret,
    });

    if (!refreshTokenDoc)
      throw new UnauthorizedException("Cannot refresh user session");

    return refreshTokenDoc;
  }

  public async generateInviteToken(email: string, userId: string) {
    const inviteDuration = +envConfigs.jwt.inviteDuration;

    const inviteToken = this.signToken(
      email,
      moment().add(inviteDuration, "hours")
    );

    const inviteExpiration = moment().add(inviteDuration, "hours");

    await this.tokenModel.create({
      token: inviteToken,
      expires: inviteExpiration.toISOString(),
      type: "invite",
      accountId: userId,
    });

    return {
      inviteToken,
      inviteExpiration,
    };
  }

  public async getInviteTokenDocByToken(token: string) {
    const tokenDoc = await this.tokenModel.findOne({
      $and: [{ token }, { expires: { $gt: new Date().toISOString() } }],
    });

    return tokenDoc;
  }

  private signToken(userId: string, expires: moment.Moment): string {
    const payload: IPayload = {
      exp: expires.unix(),
      sub: userId,
      iat: moment().unix(),
    };

    return generateJWTwithHMAC({ payload, secret: envConfigs.jwt.secret });
  }
}
