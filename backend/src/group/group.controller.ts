import { Body, Controller, Delete, Param, ParseIntPipe, Post, Req, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateGroupDto } from "./group.dto";
import { GroupService } from "./group.service";

@Controller("groups")
@UseGuards(JWTAuthGuard)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateGroupDto) {
    return this.groupService.create(req.user.id, dto);
  }

  @Delete(":id")
  async remove(@Req() req: Request, @Param("id", ParseIntPipe) groupId: number) {
    return this.groupService.remove({ groupId, userId: req.user.id });
  }
}
