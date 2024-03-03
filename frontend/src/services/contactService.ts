import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";

import axios from "@/lib/axios";
import { queryClient } from "@/lib/queryClient";
import { MyMutationOptions, MyQueryOptions } from "@/types";

export type Contact = {
  id: number;
  fullName: string;
  phone: number;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: Date;
};

export const createContactSchema = z.object({
  phone: z.number(),
});

export type CreateContactDto = z.output<typeof createContactSchema>;

const API_ENDPOINT = "/contacts";

export const invalidateContactList = () =>
  queryClient.invalidateQueries({
    queryKey: [API_ENDPOINT],
  });

export function useContactList(options?: MyQueryOptions<Contact[]>) {
  return useQuery({ queryKey: [API_ENDPOINT], ...options });
}

export function useCreateContact(options?: MyMutationOptions<any, CreateContactDto>) {
  return useMutation({
    mutationFn: (dto) => axios.post(API_ENDPOINT, dto),
    onSuccess: invalidateContactList,
    ...options,
  });
}
