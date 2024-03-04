import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

import axios from "@/lib/axios";
import { MyMutationOptions } from "@/types";

export const createGroupSchema = z.object({
  name: z.string().min(2),
  image: z.string().optional(),
  members: z.number().array().nonempty(),
});

export type CreateGroupDto = z.output<typeof createGroupSchema>;

export type GroupConversation = {
  groupId: number;
  conversationId: number;
  name: string;
  image: string | null;
};

const API_ENDPOINT = "/groups";

export function useCreateGroup(options?: MyMutationOptions<any, CreateGroupDto>) {
  return useMutation({
    mutationFn: (dto) => axios.post<GroupConversation>(API_ENDPOINT, dto),
    ...options,
  });
}
