import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as cookie from "cookie";
import { Socket } from "socket.io";

import { authConfig } from "@/config";
import { UserService } from "@/user/services/user.service";

import { AccessTokenPayload } from "../auth.module";

declare module "http" {
  export interface IncomingMessage {
    user: Request["user"];
  }
}

@Injectable()
export class WSAuthGuard implements CanActivate {
  constructor(
    @Inject(authConfig.KEY) private authConf: ConfigType<typeof authConfig>,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  async canActivate(context: ExecutionContext) {
    if (context.getType() !== "ws") {
      return true;
    }

    try {
      const client: Socket = context.switchToWs().getClient();

      const cookies = cookie.parse(client.handshake.headers.cookie, { httpOnly: true });

      const payload = this.jwtService.verify(cookies.accessToken, {
        secret: this.authConf.accessTokenSecret,
      }) as AccessTokenPayload;

      const user = await this.userService.findByPhone(payload.phone);

      client.request.user = user;

      return true;
    } catch (error) {
      return false;
    }
  }
}
