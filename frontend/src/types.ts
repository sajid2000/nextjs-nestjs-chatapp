import { UseMutationOptions, UseQueryOptions } from "@tanstack/react-query";

export type MyQueryOptions<T> = Omit<UseQueryOptions<T>, "queryKey" | "queryFn">;
export type MyMutationOptions<T, V = any> = Omit<UseMutationOptions<T, Error, V>, "mutationFn">;

export type AuthUser = {
  id: number;
  fullName: string;
  avatar?: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ConversationUser = {
  id: number;
  name: string;
  avatar: string | null;
  isOnline: boolean;
  lastSeen: Date;
};

export type PaginatedResource<T> = {
  limit: number;
  nextCursor: number | null;
  prevCursor: number | null;
  result: T;
};
