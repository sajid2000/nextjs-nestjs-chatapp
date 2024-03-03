"use client";

import { MoreHorizontalIcon, SquarePenIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
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
      const updatedIndex = v.findIndex((i) => i.id === conversation.id);

      if (updatedIndex === -1) return [];

      return v.map((i, idx) => {
        if (idx !== updatedIndex) return i;

        return { ...i, lastMessage: { ...message, senderId: sender.id } };
      });
    });
  }, []);

  const onUserConnected: ServerToClientEvents["userConnected"] = useCallback((payload) => {
    const { userId } = payload;
    setConversationList((v) => {
      const updatedIndex = v.findIndex((i) => i.participantOrGroupId === userId);

      if (updatedIndex === -1) return [];

      return v.map((i, idx) => (idx === updatedIndex ? { ...i, isOnline: true } : i));
    });
  }, []);

  const onUserDisconnected: ServerToClientEvents["userDisconnected"] = useCallback((payload) => {
    const { userId, lastSeen } = payload;
    setConversationList((v) => {
      const updatedIndex = v.findIndex((i) => i.participantOrGroupId === userId);

      if (updatedIndex === -1) return [];

      return v.map((i, idx) => (idx === updatedIndex ? { ...i, lastSeen, isOnline: false } : i));
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
          <Button variant={"ghost"} size={"icon"} className="size-9">
            <MoreHorizontalIcon size={20} />
          </Button>
          <Button variant={"ghost"} size={"icon"} className="size-9">
            <SquarePenIcon size={20} />
          </Button>
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
