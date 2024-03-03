import { Body, Controller, Get, Patch, Req, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { UpdatePasswordDto } from "../dto/profile.dto";
import { UserService } from "../services/user.service";

@Controller("profile")
@UseGuards(JWTAuthGuard)
export class ProfileController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async me(@Req() req: Request) {
    return this.userService.findById(req.user.id);
  }

  @Patch("/password")
  async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    await this.userService.updateAccountPassword(req.user.id, dto);

    return { message: "Password successfully updated" };
  }
}
