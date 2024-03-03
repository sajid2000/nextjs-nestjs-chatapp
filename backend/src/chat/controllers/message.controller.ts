import { Controller, Get, UseGuards } from "@nestjs/common";

import { JWTAuthGuard } from "@/auth/guards/jwt-auth.guard";

import { MessageService } from "../services/message.service";

@Controller("messages")
@UseGuards(JWTAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getConversationMessages() {}
}
