import { Exclude } from "class-transformer";

import { MessageEntity } from "./message.entity";

export class ThreadEntity {
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

  constructor(items: ThreadEntity) {
    Object.assign(this, items);
  }
}
