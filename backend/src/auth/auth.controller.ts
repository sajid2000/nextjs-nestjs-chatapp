import { Body, Controller, Inject, Post, Res } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";

import { appConfig, authConfig } from "@/config";

import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    @Inject(appConfig.KEY) private appConf: ConfigType<typeof appConfig>,
    @Inject(authConfig.KEY) private authConf: ConfigType<typeof authConfig>,
    private authService: AuthService
  ) {}

  @Post("/signout")
  async signOut(@Res({ passthrough: true }) res: Response) {
    res.clearCookie("accessToken");

    return { message: "Logout successfull!" };
  }

  @Post("/signin")
  async signIn(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.signIn({ password: dto.password, phone: dto.phone });

    res.cookie("accessToken", data.accessToken, {
      maxAge: 1000 * this.authConf.accessTokenExpires,
      httpOnly: true,
      secure: this.appConf.env === "production",
      path: "/",
    });

    return data.user;
  }

  @Post("/signup")
  async signUp(@Body() dto: RegisterDto) {
    return this.authService.signUp(dto);
  }
}
