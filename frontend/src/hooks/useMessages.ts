import { useInfiniteQuery } from "@tanstack/react-query";
import qs from "query-string";
import { useCallback, useEffect, useState } from "react";

import axios from "@/lib/axios";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { wait } from "@/lib/utils";
import { IMessage } from "@/services/messageService";
import { PaginatedResource } from "@/types";

export default function useMessages({ limit, conversationId }: { conversationId?: number; limit: number }) {
  const [messages, setMessages] = useState<IMessage[]>([]);

  const fetchMessages = async ({ pageParam = undefined }) => {
    await wait(1000);
    const url = qs.stringifyUrl(
      {
        url: `/conversations/${conversationId}/messages`,
        query: { limit, cursor: pageParam },
      },
      { skipNull: true }
    );

    return axios.get<PaginatedResource<IMessage[]>>(url).then((data) => data.data);
  };

  // @ts-ignore
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor,
    initialPageParam: null,
    enabled: !!conversationId,
    gcTime: 1000,
  });

  const onMessageReceived: ServerToClientEvents["messageReceived"] = useCallback(
    (payload) => {
      const { conversation, message, sender } = payload;

      if (conversation.id !== conversationId) return;

      setMessages((v) => [
        {
          ...message,
          conversationId: conversation.id,
          senderId: sender.id,
          sender,
        },
        ...v,
      ]);
    },
    [conversationId]
  );

  const onMessageDelivered: ServerToClientEvents["messageDelivered"] = useCallback(
    (payload) => {
      if (payload.conversationId !== conversationId) return;

      setMessages((v) =>
        v.map(({ messageStatus, ...rest }) => ({
          ...rest,
          messageStatus: messageStatus === "sent" ? "delivered" : messageStatus,
        }))
      );
    },
    [conversationId]
  );

  const onMessageSeen: ServerToClientEvents["messageSeen"] = useCallback(
    (payload) => {
      if (payload.conversationId !== conversationId) return;

      setMessages((v) => v.map(({ messageStatus, ...rest }) => ({ ...rest, messageStatus: "seen" })));
    },
    [conversationId]
  );

  useEffect(() => {
    if (!data) return;

    setMessages(
      data.pages.reduce((acc, page) => {
        return [...acc, ...page.result];
      }, [] as IMessage[])
    );
  }, [data]);

  useEffect(() => {
    socket.on("messageReceived", onMessageReceived);
    socket.on("messageDelivered", onMessageDelivered);
    socket.on("messageSeen", onMessageSeen);

    return () => {
      socket.off("messageReceived", onMessageReceived);
      socket.off("messageDelivered", onMessageDelivered);
      socket.off("messageSeen", onMessageSeen);
    };
  }, [onMessageReceived, onMessageDelivered, onMessageSeen]);

  return { messages, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading };
}
