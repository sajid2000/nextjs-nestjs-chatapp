"use client";

import { PhoneIcon, VideoIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import * as timeago from "timeago.js";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ServerToClientEvents, socket } from "@/lib/socket";
import { useConversationQuery } from "@/services/conversationService";
import { ConversationUser } from "@/types";

export default function ChatBoxHeader() {
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [user, setUser] = useState<ConversationUser>();

  const { data, isLoading } = useConversationQuery(conversationId);

  const onUserConnected: ServerToClientEvents["userConnected"] = useCallback(
    (payload) => {
      const { userId } = payload;

      if (user && user?.id === userId) {
        setUser({ ...user, isOnline: true });
      }
    },
    [user]
  );

  const onUserDisconnected: ServerToClientEvents["userDisconnected"] = useCallback(
    (payload) => {
      const { userId, lastSeen } = payload;

      if (user && user?.id === userId) {
        setUser({ ...user, isOnline: false, lastSeen });
      }
    },
    [user]
  );

  useEffect(() => {
    if (!data) return;

    setUser({
      id: data.participantOrGroupId,
      isOnline: data.isOnline,
      lastSeen: data.lastSeen,
      name: data.name,
      avatar: data.avatar,
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

  if (!user) return null;

  return (
    <div className="flex h-20 w-full items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <Avatar className="flex items-center justify-center">
          <AvatarImage src={user.avatar ?? ""} alt={user.name} width={6} height={6} className="size-10 " />
          <AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">{user.name}</span>
          <span className="text-xs">{user.isOnline ? "Active now" : timeago.format(user.lastSeen)}</span>
        </div>
      </div>

      <div className="space-x-2">
        <Button size={"icon"} variant={"secondary"} className="rounded-full">
          <PhoneIcon size={20} />
        </Button>
        <Button size={"icon"} variant={"secondary"} className="rounded-full">
          <VideoIcon size={20} />
        </Button>
      </div>
    </div>
  );
}
