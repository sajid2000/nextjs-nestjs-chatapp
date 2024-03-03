import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";

import axios from "@/lib/axios";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { IMessage } from "@/services/messageService";
import { PaginatedResource } from "@/types";

const MESSAGE_QUERY_LIMIT = 10;

export default function useMessages(conversationId?: number) {
  const [cursor, setCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");
  const [messages, setMessages] = useState<IMessage[]>([]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: [`/conversations/${conversationId}/messages?&limit=${MESSAGE_QUERY_LIMIT}${cursor ? `&cursor=${cursor}` : ""}`],
    queryFn: ({ queryKey }) => axios.get<PaginatedResource<IMessage[]>>(queryKey[0]).then((data) => data.data),
    enabled: !!conversationId,
  });

  const onMessageReceived: ServerToClientEvents["messageReceived"] = useCallback(
    (payload) => {
      const { conversation, message, sender } = payload;

      if (conversation.id !== conversationId) return;

      setMessages((v) => [
        ...v.filter((i) => i.id !== message.id),
        {
          ...message,
          conversationId: conversation.id,
          senderId: sender.id,
        },
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
    if (data) {
      setMessages(data.result);
      setNextCursor(data.nextCursor?.toString() || "");
    }
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

  return { messages, isLoading, isFetching, nextCursor, setCursor, error };
}
