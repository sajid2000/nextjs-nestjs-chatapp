"use client";

import { PhoneIcon, VideoIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as timeago from "timeago.js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { ConversationThread, useConversationQuery } from "@/services/conversationService";

import ContactInfo from "../ContactInfo";
import GroupInfo from "../GroupInfo";

export default function ChatBoxHeader() {
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [conversation, setConversation] = useState<ConversationThread>();

  const { data, isLoading } = useConversationQuery(conversationId);

  const onUserConnected: ServerToClientEvents["userConnected"] = useCallback(
    (payload) => {
      const { userId } = payload;

      if (conversation && conversation?.id === userId) {
        setConversation({ ...conversation, isOnline: true });
      }
    },
    [conversation]
  );

  const onUserDisconnected: ServerToClientEvents["userDisconnected"] = useCallback(
    (payload) => {
      const { userId, lastSeen } = payload;

      if (conversation && conversation?.id === userId) {
        setConversation({ ...conversation, isOnline: false, lastSeen });
      }
    },
    [conversation]
  );

  useEffect(() => {
    if (!data) return;

    setConversation({
      id: data.participantOrGroupId,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen,
      name: data.name,
      avatar: data.avatar,
      isGroup: data.isGroup,
      participantOrGroupId: data.participantOrGroupId,
    });
  }, [data]);

  useEffect(() => {
    socket.on("userConnected", onUserConnected);
    socket.on("userDisconnected", onUserDisconnected);

    return () => {
      socket.off("userConnected", onUserConnected);
      socket.off("userDisconnected", onUserDisconnected);
    };
  }, [onUserConnected, onUserDisconnected]);

  if (isLoading) {
    return (
      <div className="flex h-20 w-full items-center justify-between border-b p-4">
        <div className="flex items-center gap-2">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-2 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="size-10 rounded-full" />
          <Skeleton className="size-10 rounded-full" />
        </div>
      </div>
    );
  }

  if (!conversation) return null;

  return (
    <div className="flex h-20 w-full items-center justify-between border-b p-4">
      <div className="relative flex items-center gap-2">
        <div className="relative">
          <Avatar className="flex items-center justify-center">
            <AvatarImage src={conversation.avatar ?? ""} alt={conversation.name} width={6} height={6} className="size-10 " />
            <AvatarFallback>{conversation.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          {conversation.isOnline && <span className="absolute bottom-0 right-1 size-2 rounded-full bg-indigo-600"></span>}
        </div>
        <div className="flex flex-col">
          <span className="font-medium">{conversation.name}</span>
          <span className="text-xs">
            {conversation.isOnline ? "Active now" : conversation.isGroup ? "" : timeago.format(conversation.lastSeen)}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!data?.isGroup ? (
          <>
            <Button size={"icon"} variant={"secondary"} className="rounded-full">
              <PhoneIcon size={20} />
            </Button>
            <Button size={"icon"} variant={"secondary"} className="rounded-full">
              <VideoIcon size={20} />
            </Button>
            <ContactInfo contactId={conversation.participantOrGroupId} />
          </>
        ) : (
          <GroupInfo conversationId={conversationId} />
        )}
      </div>
    </div>
  );
}
