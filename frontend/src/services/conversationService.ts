import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import axios from "@/lib/axios";
import { queryClient } from "@/lib/queryClient";
import { MyMutationOptions, MyQueryOptions } from "@/types";

import { IMessage } from "./messageService";

export type Conversation = {
  id: number;
  participantOrGroupId: number;
  name: string;
  avatar: string | null;
  isGroup: boolean;
  lastSeen: Date;
  isOnline: boolean;
};

export type ConversationThread = Conversation & { lastMessage?: Omit<IMessage, "conversationId" | "replyId"> };

export const createConversationSchema = z.object({
  contactId: z.number(),
  isGroup: z.boolean(),
});

export type CreateConversationDto = z.output<typeof createConversationSchema>;

const API_ENDPOINT = "/conversations";

export const invalidateConversationList = () =>
  queryClient.invalidateQueries({
    queryKey: [API_ENDPOINT],
  });

export function useConversationQuery(id?: number, options?: MyQueryOptions<Conversation>) {
  return useQuery({ queryKey: [`${API_ENDPOINT}/${id}`], enabled: !!id, ...options });
}

export function useConversationListQuery(options?: MyQueryOptions<ConversationThread[]>) {
  return useQuery({ queryKey: [API_ENDPOINT], ...options });
}

export function useCreateConversation(options?: MyMutationOptions<any, CreateConversationDto>) {
  return useMutation({
    mutationFn: (dto) => axios.post(API_ENDPOINT, dto),
    onSuccess: invalidateConversationList,
    ...options,
  });
}
