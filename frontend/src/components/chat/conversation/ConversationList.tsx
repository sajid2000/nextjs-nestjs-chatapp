"use client";

import { useCallback, useEffect, useState } from "react";

import CreateGroup from "@/components/group/CreateGroup";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { ConversationThread, useConversationListQuery } from "@/services/conversationService";

import ConversationListItem from "./ConversationListItem";
import ConversationListSkeleton from "./ConversationListSkeleton";

export default function ConversationList() {
  const [conversationList, setConversationList] = useState<ConversationThread[]>([]);

  const { data, isLoading } = useConversationListQuery();

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
      const updatedConversation = v.find((i) => i.participantOrGroupId === userId);

      if (!updatedConversation) return v;

      return [{ ...updatedConversation, isOnline: true }, ...v.filter((i) => i.id !== updatedConversation.id)];
    });
  }, []);

  const onUserDisconnected: ServerToClientEvents["userDisconnected"] = useCallback((payload) => {
    const { userId, lastSeen } = payload;
    setConversationList((v) => {
      const updatedConversation = v.find((i) => i.participantOrGroupId === userId);

      if (!updatedConversation) return v;

      return [{ ...updatedConversation, lastSeen, isOnline: false }, ...v.filter((i) => i.id !== updatedConversation.id)];
    });
  }, []);

  useEffect(() => {
    if (isLoading || !data || data.length === 0) return;

    setConversationList(data);
  }, [JSON.stringify(data)]);

  useEffect(() => {
    socket.on("messageReceived", onMessageReceived);
    socket.on("userConnected", onUserConnected);
    socket.on("userDisconnected", onUserDisconnected);

    return () => {
      socket.off("messageReceived", onMessageReceived);
      socket.off("userConnected", onUserConnected);
      socket.off("userDisconnected", onUserDisconnected);
    };
  }, [onMessageReceived, onUserConnected, onUserDisconnected]);

  if (isLoading) return <ConversationListSkeleton />;

  return (
    <div className="group space-y-4 overflow-auto p-2">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 text-2xl">
          <p className="font-medium">Chats</p>
          <span className="">({conversationList.length})</span>
        </div>
        <div>
          <CreateGroup />
        </div>
      </div>
      <nav className={cn("flex flex-col gap-2")}>
        {conversationList.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} />
        ))}
      </nav>
    </div>
  );
}
