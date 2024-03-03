import { useInfiniteQuery } from "@tanstack/react-query";
import qs from "query-string";

import axios from "@/lib/axios";
import { PaginatedResource } from "@/types";

export interface IMessage {
  id: number;
  messageContent: string;
  senderId: number;
  conversationId: number;
  replyId: number | null;
  messageType: "text" | "image" | "voice";
  messageStatus: "sent" | "delivered" | "seen";
  sentDate: Date;
}

export interface MessageTyping {
  conversationId: number;
  receiverId: number;
}

export interface MessageSendRequestPayload {
  conversationId: number;
  messageContent: string;
  messageType: string;
}

export interface MessageResponsePayload {
  message: Omit<IMessage, "conversationId" | "senderId">;
  conversation: {
    id: number;
    isGroup: boolean;
  };
  sender: {
    id: number;
    name: string;
    avatar: string | null;
  };
}

export interface MessageQueryParams {
  conversationId: number;
  limit: number;
  cursor?: string;
}

const MESSAGE_QUERY_LIMIT = 10;

export function useMessageQuery(conversationId: number) {
  const fetchMessages = async (pageParam: number | null) => {
    const url = qs.stringifyUrl(
      {
        url: `/conversations/${conversationId}/messages`,
        query: {
          limit: MESSAGE_QUERY_LIMIT,
          cursor: pageParam,
        },
      },
      { skipNull: true }
    );

    return axios.get<PaginatedResource<IMessage[]>>(url).then((data) => data.data);
  };

  return useInfiniteQuery({
    queryKey: [`/conversations/${conversationId}/messages`],
    queryFn: ({ pageParam }) => fetchMessages(pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as null | number,
  });
}
