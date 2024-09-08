import {
  DNextFunc,
  DRequest,
  DResponse,
  ForbiddenException,
  IPayload,
  UnauthorizedException,
} from "@dolphjs/dolph/common";
import { verifyJWTwithHMAC } from "@dolphjs/dolph/utilities";
import envConfigs from "../configs/env.configs";
import moment from "moment";
import { AccountService } from "@/components/account/account.service";
import { sterilizeAccount } from "@/components/account/account.sterializer";

const accountService = new AccountService();

export const AuthShield = async (
  req: DRequest,
  res: DResponse,
  next: DNextFunc
) => {
  try {
    let authToken = req.headers["authorization"] as string;

    if (!authToken) {
      return next(
        new UnauthorizedException("Provide a valid authorization token header")
      );
    }

    const bearer = authToken.split(" ")[0];

    if (bearer !== "Bearer")
      return next(
        new UnauthorizedException("Provide a valid authorization token header")
      );

    authToken = authToken.split(" ")[1];

    const payload = verifyJWTwithHMAC({
      token: authToken,
      secret: envConfigs.jwt.secret,
    });

    if (!payload)
      return next(new UnauthorizedException("Invalid or expired token"));

    const user = await accountService.getAccount({ _id: payload.sub });

    if (!user)
      return next(
        new ForbiddenException("Cannot find this authenticated account")
      );

    req.payload = {
      sub: user._id.toString(),
      info: sterilizeAccount(user),
      exp: moment().add(1, "hour").unix(),
      iat: moment().unix(),
    };

    next();
  } catch (e: any) {
    next(new UnauthorizedException(e));
  }
};
