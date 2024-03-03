"use client";

import { DotFilledIcon } from "@radix-ui/react-icons";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { useSession } from "@/contexts/SessionProvider";
import useMessages from "@/hooks/useMessages";
import { ServerToClientEvents, socket } from "@/lib/socket";

import ChatBoxFooter from "./ChatBoxFooter";
import MessageItem from "./MessageItem";
import MessageSkeleton from "./MessageSkeleton";

export default function ChatBoxMessages() {
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [isTyping, setIsTyping] = useState(false);

  const { user } = useSession();
  const { messages, isLoading } = useMessages(conversationId);

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
      if (conversationId === payload.conversationId) {
        setIsTyping(true);
      }
    },
    [conversationId]
  );

  const onMessageTypingStop: ServerToClientEvents["messageTypingStop"] = useCallback(
    (payload) => {
      if (conversationId === payload.conversationId) {
        setIsTyping(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (messagesContainerRef.current && isTyping) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [isTyping]);

  useEffect(() => {
    socket.on("messageTypingStart", onMessageTypingStart);
    socket.on("messageTypingStop", onMessageTypingStop);

    return () => {
      socket.off("messageTypingStart", onMessageTypingStart);
      socket.off("messageTypingStop", onMessageTypingStop);
    };
  }, [onMessageTypingStart, onMessageTypingStop]);

  useEffect(() => {
    socket.volatile.emit("messageSeen", { conversationId });
  }, []);

  return (
    <div className="flex size-full flex-col overflow-y-auto ">
      <div ref={messagesContainerRef} className="flex size-full flex-col overflow-y-auto pb-2">
        {isLoading ? (
          <MessageSkeleton />
        ) : (
          <AnimatePresence>
            {messages
              ?.sort((a, b) => a.id - b.id)
              .map((message, index) => (
                <motion.div
                  key={index}
                  layout
                  initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
                  animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
                  transition={{
                    opacity: { duration: 0.1 },
                    layout: {
                      type: "spring",
                      bounce: 0.3,
                      duration: messages.indexOf(message) * 0.05 + 0.2,
                    },
                  }}
                  style={{
                    originX: 0.5,
                    originY: 0.5,
                  }}
                >
                  <MessageItem
                    own={message.senderId === user?.id}
                    id={message.id}
                    message={message.messageContent}
                    sentAt={message.sentDate}
                    status={message.messageStatus}
                  />
                </motion.div>
              ))}
          </AnimatePresence>
        )}
        <div className={`px-4 ${isTyping ? "flex" : "hidden"}`}>
          <div className="flex gap-1 rounded-lg bg-muted p-3 pb-2">
            <DotFilledIcon className="animate-bounce" />
            <DotFilledIcon className="animate-bounce delay-100" />
            <DotFilledIcon className="animate-bounce delay-200" />
          </div>
        </div>
      </div>
      <ChatBoxFooter sendMessage={sendMessage} />
    </div>
  );
}
