"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ServerToClientEvents, socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { ConversationThread, useThreadListQuery } from "@/services/conversationService";

import ConversationListItem from "./ConversationListItem";
import ConversationListSkeleton from "./ConversationListSkeleton";
import CreateGroupConversation from "./CreateGroupConversation";

export default function ConversationList() {
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [conversationList, setConversationList] = useState<ConversationThread[]>([]);

  const { data, isLoading } = useThreadListQuery();

  const onNewConversation: ServerToClientEvents["newConversation"] = useCallback((payload) => {
    const { id, name, avatar, isGroup, isOnline, lastSeen, participantOrGroupId } = payload;

    setConversationList((v) => {
      return [{ id, name, avatar, isGroup, isOnline, lastSeen, participantOrGroupId }, ...v.filter((i) => i.id !== id)];
    });

    socket.volatile.emit("joinConversation", { conversationId: id });
  }, []);

  const onMessageReceived: ServerToClientEvents["messageReceived"] = useCallback((payload) => {
    const { conversation, message, sender } = payload;

    setConversationList((v) => {
      const updatedConversation = v.find((i) => i.id === conversation.id);

      if (!updatedConversation) return v;

      return [
        { ...updatedConversation, lastMessage: { ...message, senderId: sender.id } },
        ...v.filter((i) => i.id !== updatedConversation.id),
      ];
    });
  }, []);

  const onUserConnected: ServerToClientEvents["userConnected"] = useCallback((payload) => {
    const { userId } = payload;
    setConversationList((v) => {
      return v.map((i) => {
        if (i.participantOrGroupId !== userId) return i;

        return { ...i, isOnline: true };
      });
    });
  }, []);

  const onUserDisconnected: ServerToClientEvents["userDisconnected"] = useCallback((payload) => {
    const { userId, lastSeen } = payload;
    setConversationList((v) => {
      return v.map((i) => {
        if (i.participantOrGroupId !== userId) return i;

        return { ...i, isOnline: false, lastSeen };
      });
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setConversationList(data ?? []);
  }, [JSON.stringify(data)]);

  useEffect(() => {
    socket.on("newConversation", onNewConversation);
    socket.on("messageReceived", onMessageReceived);
    socket.on("userConnected", onUserConnected);
    socket.on("userDisconnected", onUserDisconnected);

    return () => {
      socket.off("newConversation", onNewConversation);
      socket.off("messageReceived", onMessageReceived);
      socket.off("userConnected", onUserConnected);
      socket.off("userDisconnected", onUserDisconnected);
    };
  }, [onNewConversation, onMessageReceived, onUserConnected, onUserDisconnected]);

  if (isLoading) return <ConversationListSkeleton />;

  return (
    <div className="group space-y-4 overflow-auto p-2">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 text-2xl">
          <p className="font-medium">Chats</p>
          <span className="">({conversationList.length})</span>
        </div>
        <div>
          <CreateGroupConversation />
        </div>
      </div>
      <nav className={cn("flex flex-col gap-2")}>
        {conversationList.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} active={conversation.id === conversationId} />
        ))}
      </nav>
    </div>
  );
}
