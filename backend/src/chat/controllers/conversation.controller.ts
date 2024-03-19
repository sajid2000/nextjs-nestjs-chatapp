import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateGroupDto } from "../dto/group.dto";
import { ConversationService } from "../services/conversation.service";
import { GroupService } from "../services/group.service";
import { MessageService } from "../services/message.service";
import { MessageQueryParams } from "../types";

@Controller("conversations")
@UseGuards(JWTAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
    private readonly groupService: GroupService,
    private readonly messageService: MessageService
  ) {}

  @Get()
  async getAllConversationOfUser(@Req() req: Request) {
    return this.conversationService.getAllConversationOfUser(req.user.id);
  }

  @Get("private/:contactId")
  async getConversationByContact(@Req() req: Request, @Param("contactId", ParseIntPipe) contactId: number) {
    return this.conversationService.getPrivateConversationByContact({ userId: req.user.id, contactId });
  }

  @Get(":id")
  async getConversationWithDetails(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.getConversationWithDetails({ userId: req.user.id, conversationId: id });
  }

  @Get(":id/groupInfo")
  async getGroupInfo(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.getGroupInfo({ userId: req.user.id, conversationId: id });
  }

  @Get(":id/member/:memberId")
  async getGroupMemberInfo(
    @Req() req: Request,
    @Param("id", ParseIntPipe) id: number,
    @Param("memberId", ParseIntPipe) memberId: number
  ) {
    const group = await this.groupService.getByConversationId(id);
    const isUserMemberOfGroup = await this.groupService.isGroupMember({ groupId: group.id, userId: req.user.id });

    if (!isUserMemberOfGroup) throw new NotFoundException();

    return this.conversationService.getGroupMember({ memberId, groupId: group.id });
  }

  @Get(":id/messages")
  async getConversationMessages(@Req() req: Request, @Param("id", ParseIntPipe) id: number, @Query() query: MessageQueryParams) {
    return this.messageService.getMessagesByConversationId(req.user.id, id, query);
  }

  @Post("group")
  async createGroupConversation(@Req() req: Request, @Body() dto: CreateGroupDto) {
    return this.conversationService.createGroupConversation(req.user.id, dto);
  }

  @Delete(":id")
  async removeConversation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.softDeleteUserConversation({ userId: req.user.id, conversationId: id });
  }

  @Delete("group/:groupId")
  async deleteGroup(@Req() req: Request, @Param("groupId", ParseIntPipe) groupId: number) {
    return this.conversationService.deleteGroup({ userId: req.user.id, groupId });
  }
}
