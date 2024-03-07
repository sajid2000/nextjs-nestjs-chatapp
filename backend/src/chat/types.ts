export interface MessageQueryParams {
  limit: number;
  cursor?: number;
}

export interface Thread {
  id: number;
  participantId: number;
  isGroup: boolean;
  name: string;
  avatar: string | null;
  lastSeen: Date;
  isOnline: boolean;
  lastMessageId: number;
  lastMessageContent: string;
  lastMessageSenderId: number;
  lastMessageSentDate: Date;
  lastMessageStatus: string;
  lastMessageType: string;
  lastMessageDeletedAt: Date | null;
}

export interface MessageResponsePayload {
  message: {
    id: number;
    messageContent: string;
    messageStatus: "sent" | "delivered" | "seen";
    messageType: "text" | "voice" | "image";
    replyId?: number | null;
    sentDate: Date;
  };
  conversation: {
    id: number;
    isGroup: boolean;
  };
  sender: {
    id: number;
    fullName: string;
    avatar: string | null;
  };
}

export const MESSAGE_STATUS = {
  sent: "sent",
  delivered: "delivered",
  seen: "seen",
} as const;
