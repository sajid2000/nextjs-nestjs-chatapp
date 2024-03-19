import { Exclude } from "class-transformer";

import { MessageEntity } from "./message.entity";

export class ConversationEntity {
  id: number;

  participantOrGroupId: number;

  name: string;

  avatar: string | null;

  isGroup: boolean;

  @Exclude()
  isDeleted: boolean;

  isOnline: boolean;

  lastSeen: Date;

  lastMessage?: Omit<MessageEntity, "conversationId" | "replyId">;

  constructor(items: ConversationEntity) {
    Object.assign(this, items);
  }
}
