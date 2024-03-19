"use client";

import { DotFilledIcon } from "@radix-ui/react-icons";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSession } from "@/contexts/SessionProvider";
import useMessages from "@/hooks/useMessages";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { useConversationQuery } from "@/services/conversationService";

import ChatBoxFooter from "./ChatBoxFooter";
import MessageItem from "./MessageItem";
import MessageSkeleton from "./MessageSkeleton";

const MESSAGE_QUERY_LIMIT = 10;

let pauseScroll = false;

export default function ChatBoxMessages() {
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollTopRef = useRef<HTMLDivElement>(null);

  const [isTyping, setIsTyping] = useState(false);
  const [isInTop, setIsInTop] = useState(false);

  const { user } = useSession();
  const { messages, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages({
    conversationId,
    limit: MESSAGE_QUERY_LIMIT,
  });
  const { data: conversation } = useConversationQuery(conversationId);

  const sendMessage = (textMessage: string) => {
    if (!user || !conversationId) return;

    socket.volatile.emit("messageSend", {
      conversationId: conversationId,
      messageContent: textMessage,
      messageType: "text",
    });
  };

  const onMessageTypingStart: ServerToClientEvents["messageTypingStart"] = useCallback(
    (payload) => {
      pauseScroll = false;

      if (conversationId === payload.conversationId) {
        setIsTyping(true);
      }
    },
    [conversationId]
  );

  const onMessageTypingStop: ServerToClientEvents["messageTypingStop"] = useCallback(
    (payload) => {
      pauseScroll = false;

      if (conversationId === payload.conversationId) {
        setIsTyping(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading) {
        pauseScroll = true;

        setIsInTop(true);
      }
    });

    scrollTopRef.current && observer.observe(scrollTopRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLoading]);

  useEffect(() => {
    if (isInTop && hasNextPage && !isFetchingNextPage) {
      pauseScroll = true;

      fetchNextPage();
      setIsInTop(false);
    }
  }, [isInTop, hasNextPage, isFetchingNextPage]);

  useEffect(() => {
    socket.on("messageTypingStart", onMessageTypingStart);
    socket.on("messageTypingStop", onMessageTypingStop);

    return () => {
      socket.off("messageTypingStart", onMessageTypingStart);
      socket.off("messageTypingStop", onMessageTypingStop);
    };
  }, [onMessageTypingStart, onMessageTypingStop]);

  useEffect(() => {
    if (messagesContainerRef.current && (!pauseScroll || isTyping)) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  useEffect(() => {
    socket.volatile.emit("messageSeen", { conversationId });
  }, []);

  return (
    <div className="flex size-full flex-col overflow-y-auto ">
      <div ref={messagesContainerRef} className="flex size-full flex-col-reverse overflow-y-auto pb-2">
        {isLoading ? (
          <MessageSkeleton />
        ) : (
          <>
            <div key="bottom" className={`px-4 ${isTyping ? "flex" : "hidden"}`}>
              <div className="flex gap-1 rounded-lg bg-muted p-6 pb-4">
                <DotFilledIcon className="animate-bounce" />
                <DotFilledIcon className="animate-bounce delay-100" />
                <DotFilledIcon className="animate-bounce delay-200" />
              </div>
            </div>
            {messages.map((message) => (
              <div key={message.id}>
                <MessageItem
                  isGroup={conversation?.isGroup ?? true}
                  sender={message.sender}
                  own={message.senderId === user?.id}
                  id={message.id}
                  message={message.messageContent}
                  sentAt={message.sentDate}
                  status={message.messageStatus}
                />
              </div>
            ))}
            <div key="top" className="flex min-h-12 items-center justify-center py-1">
              <div ref={messages.length < MESSAGE_QUERY_LIMIT ? null : scrollTopRef}>
                {hasNextPage && isFetchingNextPage && <Loader2 className="size-6 animate-spin" />}
                {!hasNextPage && messages.length > MESSAGE_QUERY_LIMIT && <div>No more messages</div>}
              </div>
            </div>
          </>
        )}
      </div>
      <ChatBoxFooter isGroup={conversation?.isGroup ?? true} sendMessage={sendMessage} />
    </div>
  );
}
