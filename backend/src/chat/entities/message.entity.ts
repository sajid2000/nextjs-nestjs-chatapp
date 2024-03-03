import { MESSAGE_STATUS } from "../types";

export class MessageEntity {
  id: number;

  messageContent: string;

  senderId: number;

  conversationId: number;

  replyId: number | null;

  messageType: "text" | "image" | "voice" | string;

  messageStatus: keyof typeof MESSAGE_STATUS | string;

  sentDate: Date;

  deleteAt: Date | null;

  constructor(items: MessageEntity) {
    Object.assign(this, items);
  }
}
