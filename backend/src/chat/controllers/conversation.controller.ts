import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { CreateConversationDto } from "../dto/conversation.dto";
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

  @Post("private")
  async createConversation(@Req() req: Request, @Body() dto: CreateConversationDto) {
    return this.conversationService.createOrGetPrivateConversation({ ...dto, userId: req.user.id });
  }

  @Get()
  async getUserConversationThreads(@Req() req: Request) {
    return this.conversationService.getUserConversationThreads(req.user.id);
  }

  @Get(":id")
  async getUserConversation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    return this.conversationService.getUserConversation({ userId: req.user.id, conversationId: id });
  }

  @Delete(":id")
  async removeConversation() {
    //
  }

  @Get("/:id/messages")
  async getConversationMessages(@Req() req: Request, @Param("id", ParseIntPipe) id: number, @Query() query: MessageQueryParams) {
    return this.messageService.getMessagesByConversationId(req.user.id, id, query);
  }
}
