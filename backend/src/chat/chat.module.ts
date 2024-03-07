import { Module } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import { UserRepository } from "@/user/repositories/user.repository";
import { UserService } from "@/user/services/user.service";

import { ChatGateway } from "./chat.gateway";
import { ConversationController } from "./controllers/conversation.controller";
import { ConversationRepository } from "./repositories/conversation.repository";
import { GroupRepository } from "./repositories/group.repository";
import { MessageRepository } from "./repositories/message.repository";
import { ConversationService } from "./services/conversation.service";
import { GroupService } from "./services/group.service";
import { MessageService } from "./services/message.service";

@Module({
  imports: [],
  controllers: [ConversationController],
  providers: [
    ChatGateway,
    JwtService,
    UserRepository,
    UserService,
    MessageRepository,
    MessageService,
    ConversationRepository,
    ConversationService,
    GroupRepository,
    GroupService,
  ],
  exports: [],
})
export class ChatModule {}
