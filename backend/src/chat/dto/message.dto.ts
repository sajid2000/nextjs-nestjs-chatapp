import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const createMessageSchema = z.object({
  messageContent: z.string(),
  senderId: z.number(),
  conversationId: z.number(),
  replyId: z.number().optional().nullable(),
  messageType: z.string(),
});

export class CreateMessageDto extends createZodDto(createMessageSchema) {}

export const updateMessageSchema = z.object({
  messageId: z.number(),
  conversationId: z.number(),
  status: z.enum(["sent", "delivered", "seen"]),
});

export class UpdateMessageDto extends createZodDto(updateMessageSchema) {}

export const messageSendRequestSchema = z.object({
  conversationId: z.number().nonnegative(),
  messageType: z.enum(["text", "image", "voice"]),
  messageContent: z.string(),
});

export const messageDeliveredRequestSchema = z.object({
  conversationId: z.number().nonnegative(),
});

export const messageSeenRequestSchema = z.object({
  conversationId: z.number().nonnegative(),
});

export const messageTypingRequestSchema = z.object({
  conversationId: z.number().nonnegative(),
});
