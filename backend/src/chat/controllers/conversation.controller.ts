import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateConversationDto } from "../dto/conversation.dto";
import { CreateGroupDto } from "../dto/group.dto";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { MessageQueryParams } from "../types";

@Controller("conversations")
@UseGuards(JWTAuthGuard)
export class ConversationController {
  constructor(
    private readonly conversationService: ConversationService,
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
  async getGroupConversationInfo(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.getGroupConversationInfo({ userId: req.user.id, conversationId: id });
  }

  @Get(":id/member/:memberId")
  async getGroupConversationMemberInfo(
    @Req() req: Request,
    @Param("id", ParseIntPipe) id: number,
    @Param("memberId", ParseIntPipe) memberId: number
  ) {
    return this.conversationService.getGroupMemberInfo(req.user.id, { memberId, conversationId: id });
  }

  @Get(":id/messages")
  async getConversationMessages(@Req() req: Request, @Param("id", ParseIntPipe) id: number, @Query() query: MessageQueryParams) {
    return this.messageService.getMessagesByConversationId(req.user.id, id, query);
  }

  @Post("private")
  async createPrivateConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    return this.conversationService.createPrivateConversation({ ...dto, userId: req.user.id });
  }

  @Post("group")
  async createGroupConversation(@Req() req: Request, @Body() dto: CreateGroupDto) {
    return this.conversationService.createGroupConversation(req.user.id, dto);
  }

  @Delete(":id")
  async removeConversation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.removeUserConversation({ userId: req.user.id, conversationId: id });
  }

  @Delete(":id/force")
  async deleteGroupConversation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.deleteGroupConversation({ userId: req.user.id, conversationId: id });
  }
}
