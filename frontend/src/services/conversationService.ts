import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import axios from "@/lib/axios";
import { queryClient } from "@/lib/queryClient";
import { MyMutationOptions, MyQueryOptions } from "@/types";

import { IMessage } from "./messageService";

type Conversation = {
  id: number;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type GroupInfo = {
  id: number;
  conversationId: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  image: string | null;
  creator: number | null;
  members: {
    id: number;
    fullName: string;
    phone: number;
    avatar: string | null;
  }[];
};

export type ConversationThread = {
  id: number;
  participantOrGroupId: number;
  name: string;
  avatar: string | null;
  isGroup: boolean;
  lastSeen: Date;
  isOnline: boolean;
  lastMessage?: Omit<IMessage, "conversationId" | "replyId" | "sender">;
};

export const createGroupConversationSchema = z.object({
  name: z.string().min(2),
  image: z.string().optional(),
  members: z.number().array().nonempty(),
});
export type CreateGroupConversationDto = z.output<typeof createGroupConversationSchema>;

const API_ENDPOINT = "/conversations";

export const invalidateConversationList = () =>
  queryClient.invalidateQueries({
    queryKey: [API_ENDPOINT],
  });

export function useConversationQuery(id?: number, options?: MyQueryOptions<ConversationThread>) {
  return useQuery({ queryKey: [`${API_ENDPOINT}/${id}`], enabled: !!id, ...options });
}

export function useThreadListQuery(options?: MyQueryOptions<ConversationThread[]>) {
  return useQuery({ queryKey: [API_ENDPOINT], ...options });
}

export function usePrivateConversationByContact(options?: MyMutationOptions<any, number>) {
  return useMutation({
    mutationFn: (contactId) => axios.get<Conversation>(`${API_ENDPOINT}/private/${contactId}`),
    ...options,
  });
}

export function useCreateGroupConversation(options?: MyMutationOptions<any, CreateGroupConversationDto>) {
  return useMutation({
    mutationFn: (dto) => axios.post<Conversation & { groupId: number }>(`${API_ENDPOINT}/group`, dto),
    onSuccess: invalidateConversationList,
    ...options,
  });
}

export function useGroupConversationInfo(id?: number, options?: MyQueryOptions<GroupInfo>) {
  return useQuery({ queryKey: [`${API_ENDPOINT}/${id}/groupInfo`], enabled: !!id, ...options });
}

export function useDeleteGroup(options?: MyMutationOptions<any, { groupId: number }>) {
  return useMutation({
    mutationFn: ({ groupId }) => axios.delete(`${API_ENDPOINT}/group/${groupId}`),
    onSuccess: invalidateConversationList,
    ...options,
  });
}
