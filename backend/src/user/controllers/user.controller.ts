import { Controller, Get, Param, ParseIntPipe, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { UserService } from "../services/user.service";

@Controller("users")
@UseGuards(JWTAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.userService.findById(id);
  }
}
