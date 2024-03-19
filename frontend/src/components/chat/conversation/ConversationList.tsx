"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { ServerToClientEvents, socket } from "@/lib/socket";
import { cn } from "@/lib/utils";
import { ConversationThread, useThreadListQuery } from "@/services/conversationService";

import ConversationListItem from "./ConversationListItem";
import ConversationListSkeleton from "./ConversationListSkeleton";
import CreateGroupConversation from "./CreateGroupConversation";

export default function ConversationList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [conversationList, setConversationList] = useState<(ConversationThread & { isTyping?: boolean })[]>([]);

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

      if (!updatedConversation) {
        return [
          {
            ...conversation,
            avatar: sender.avatar,
            name: sender.fullName,
            isOnline: true,
            lastSeen: new Date(),
            participantOrGroupId: sender.id,
            lastMessage: { ...message, senderId: sender.id },
          },
          ...v,
        ];
      }

      return [
        { ...updatedConversation, lastMessage: { ...message, senderId: sender.id } },
        ...v.filter((i) => i.id !== updatedConversation.id),
      ];
    });
  }, []);

  const onBannedFromGroup: ServerToClientEvents["bannedFromGroup"] = useCallback((payload) => {
    const { conversationId } = payload;

    socket.volatile.emit("leaveConversation", { conversationId });

    setConversationList((v) => v.filter((i) => i.id !== conversationId));

    router.replace("/");
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

  const onMessageTypingStart: ServerToClientEvents["messageTypingStart"] = useCallback(({ conversationId }) => {
    setConversationList((v) => {
      return v.map((i) => (i.id !== conversationId ? i : { ...i, isTyping: true }));
    });
  }, []);

  const onMessageTypingStop: ServerToClientEvents["messageTypingStop"] = useCallback(({ conversationId }) => {
    setConversationList((v) => {
      return v.map((i) => (i.id !== conversationId ? i : { ...i, isTyping: false }));
    });
  }, []);

  useEffect(() => {
    if (isLoading) return;

    setConversationList(data ?? []);
  }, [JSON.stringify(data)]);

  useEffect(() => {
    socket.on("newConversation", onNewConversation);
    socket.on("bannedFromGroup", onBannedFromGroup);
    socket.on("messageReceived", onMessageReceived);
    socket.on("userConnected", onUserConnected);
    socket.on("userDisconnected", onUserDisconnected);
    socket.on("messageTypingStart", onMessageTypingStart);
    socket.on("messageTypingStop", onMessageTypingStop);

    return () => {
      socket.off("newConversation", onNewConversation);
      socket.off("bannedFromGroup", onBannedFromGroup);
      socket.off("messageReceived", onMessageReceived);
      socket.off("userConnected", onUserConnected);
      socket.off("userDisconnected", onUserDisconnected);
      socket.off("messageTypingStart", onMessageTypingStart);
      socket.off("messageTypingStop", onMessageTypingStop);
    };
  }, [
    onNewConversation,
    onBannedFromGroup,
    onMessageReceived,
    onUserConnected,
    onUserDisconnected,
    onMessageTypingStart,
    onMessageTypingStop,
  ]);

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
