import { Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { authConfig } from "@/config";

import { AccessTokenPayload, JWT_STRATEGY } from "../auth.module";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY) {
  constructor(
    private authService: AuthService,
    @Inject(authConfig.KEY) authConf: ConfigType<typeof authConfig>
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: any) => {
          if (req.cookies && req.cookies.accessToken?.length > 0) {
            return req.cookies.accessToken;
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: authConf.accessTokenSecret,
    });
  }

  async validate(payload: AccessTokenPayload): Promise<Request["user"]> {
    const user = await this.authService.validateUser(payload.userId);

    return {
      id: payload.userId,
      phone: user.phone,
      fullName: user.fullName,
      avatar: user.avatar,
    };
  }
}
