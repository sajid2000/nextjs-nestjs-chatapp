"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect } from "react";
import { toast } from "sonner";

import axios from "@/lib/axios";
import { AUTH_URI } from "@/lib/constants";
import { ServerToClientEvents, socket } from "@/lib/socket";

import { useSession } from "./SessionProvider";

const Context = createContext({});

const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const { user } = useSession();

  const onMessageReceived: ServerToClientEvents["messageReceived"] = useCallback(
    (payload) => {
      const { conversation, sender } = payload;

      if (user?.id !== sender.id) {
        // show notifications
        if (conversationId !== conversation.id) {
          let msg = payload.message.messageContent;

          if (payload.message.messageType === "image") msg = "Sent an image";
          if (payload.message.messageType === "voice") msg = "Sent a voice";

          toast.info(`${sender.name}: ${msg}`);
        }

        if (conversation.id === conversationId) {
          socket.volatile.emit("messageSeen", {
            conversationId: payload.conversation.id,
          });
        } else {
          socket.volatile.emit("messageDelivered", { conversationId: conversation.id });
        }
      }
    },
    [conversationId, user]
  );

  useEffect(() => {
    socket.on("messageReceived", onMessageReceived);

    return () => {
      socket.off("messageReceived", onMessageReceived);
    };
  }, [onMessageReceived]);

  useEffect(() => {
    socket.connect();

    socket.onAny((ev) => console.log(ev));

    socket.on("exception", (error) => {
      console.log(error);

      if (error.message) {
        return toast.error(error.message);
      }
    });

    socket.on("connect_error", async (err) => {
      if (err?.message === "Unauthorized") {
        await axios.post("auth/signout");

        router.push(AUTH_URI.signIn);
        router.refresh();
      }

      console.log(err);
    });

    return () => {
      socket.off("connect_error");

      if (socket.connected) socket.disconnect();
    };
  }, []);

  return <Context.Provider value={{}}>{children}</Context.Provider>;
};

export default ChatProvider;

export const useChat = () => useContext(Context);
