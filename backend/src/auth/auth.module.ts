import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { authConfig } from "@/config";
import { UserService } from "@/user/services/user.service";
import { UserModule } from "@/user/user.module";

import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./strategies/jwt.strategy";

export type AccessTokenPayload = {
  phone: number;
};

export const JWT_STRATEGY = "jwt";

@Module({
  controllers: [AuthController],
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: (config: ConfigType<typeof authConfig>) => ({
        secret: config.accessTokenSecret,
        signOptions: {
          expiresIn: config.accessTokenExpires + "s",
        },
      }),
    }),
  ],
  providers: [AuthService, UserService, JwtStrategy],
})
export class AuthModule {}
