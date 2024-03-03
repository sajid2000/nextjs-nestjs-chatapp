import { io, Socket } from "socket.io-client";

import { MessageResponsePayload, MessageSendRequestPayload } from "@/services/messageService";

type CB = (data: unknown) => void;

export interface ServerToClientEvents {
  // message
  messageReceived: (data: MessageResponsePayload) => void;
  messageDelivered: (data: { conversationId: number }) => void;
  messageSeen: (data: { conversationId: number }) => void;
  userConnected: (data: { userId: number; name: string; phone: string }) => void;
  userDisconnected: (data: { userId: number; lastSeen: Date }) => void;
  messageTypingStart: (data: { conversationId: number; receiverId: number }) => void;
  messageTypingStop: (data: { conversationId: number; receiverId: number }) => void;
}

export interface ClientToServerEvents {
  // message
  messageSend: (data: MessageSendRequestPayload, cb?: CB) => void;
  messageDelivered: (data: { conversationId: number }, cb?: CB) => void;
  messageSeen: (data: { conversationId: number }, cb?: CB) => void;
  messageTypingStart: (data: { conversationId: number }, cb?: CB) => void;
  messageTypingStop: (data: { conversationId: number }, cb?: CB) => void;
}

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io("http://localhost:4000", {
  autoConnect: false,
  withCredentials: true,
});
