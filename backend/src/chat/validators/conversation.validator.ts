import { z } from "zod";

export const createConversationSchema = z.object({
  contactId: z.number(),
});

export const privateConversationCreatedRequestSchema = z.object({
  conversationId: z.number(),
});

export const groupConversationCreatedRequestSchema = z.object({
  conversationId: z.number(),
});

export const joinConversationRequestSchema = z.object({
  conversationId: z.number(),
});

export const kickGroupMemberRequestSchema = z.object({
  memberId: z.number(),
  conversationId: z.number(),
});
