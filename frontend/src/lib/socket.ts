import { io, Socket } from "socket.io-client";

import { ConversationThread } from "@/services/conversationService";
import { MessageResponsePayload, MessageSendRequestPayload } from "@/services/messageService";

export interface ServerToClientEvents {
  // message
  newConversation: (data: ConversationThread) => void;
  messageReceived: (data: MessageResponsePayload) => void;
  messageDelivered: (data: { conversationId: number }) => void;
  messageSeen: (data: { conversationId: number }) => void;
  bannedFromGroup: (data: { conversationId: number }) => void;
  userConnected: (data: { userId: number; name: string; phone: string }) => void;
  userDisconnected: (data: { userId: number; lastSeen: Date }) => void;
  messageTypingStart: (data: { conversationId: number; receiverId: number }) => void;
  messageTypingStop: (data: { conversationId: number; receiverId: number }) => void;
  exception: (data: any) => void;
}

export interface ClientToServerEvents {
  // message
  createPrivateConversation: (data: { contactId: number }) => void;
  groupConversationCreated: (data: { conversationId: number; groupId: number }) => void;
  joinConversation: (data: { conversationId: number }) => void;
  leaveConversation: (data: { conversationId: number }) => void;
  kickGroupMember: (data: { conversationId: number; memberId: number }) => void;
  messageSend: (data: MessageSendRequestPayload) => void;
  messageDelivered: (data: { conversationId: number }) => void;
  messageSeen: (data: { conversationId: number }) => void;
  messageTypingStart: (data: { conversationId: number }) => void;
  messageTypingStop: (data: { conversationId: number }) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:4000", {
  autoConnect: false,
  withCredentials: true,
});
