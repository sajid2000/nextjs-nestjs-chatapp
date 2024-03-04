import { Module } from "@nestjs/common";

import { ConversationRepository } from "@/chat/repositories/conversation.repository";
import { ConversationService } from "@/chat/services/conversation.service";
import { UserRepository } from "@/user/repositories/user.repository";
import { UserService } from "@/user/services/user.service";

import { GroupController } from "./group.controller";
import { GroupRepository } from "./group.repository";
import { GroupService } from "./group.service";

@Module({
  controllers: [GroupController],
  providers: [GroupService, GroupRepository, UserService, UserRepository, ConversationService, ConversationRepository],
  exports: [GroupService, GroupRepository],
})
export class GroupModule {}
