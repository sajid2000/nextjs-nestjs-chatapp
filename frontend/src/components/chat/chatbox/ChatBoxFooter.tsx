import { AnimatePresence, motion } from "framer-motion";
import { FileImageIcon, MicIcon, PaperclipIcon, PlusCircleIcon, SendHorizonalIcon, ThumbsUpIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

import EmojiPicker from "@/components/EmojiPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { socket } from "@/lib/socket";

interface Props {
  sendMessage: (textMessage: string) => void;
  isGroup: boolean;
}

export default function ChatBoxFooter({ sendMessage, isGroup }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const conversationId = parseInt(searchParams.get("conversation") ?? "");

  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const handleThumbsUp = () => {
    sendMessage("👍");
  };

  const handleSend = () => {
    if (message.trim()) {
      sendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }

    if (event.key === "Enter" && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + "\n");
    }
  };

  useEffect(() => {
    if (!conversationId || !isMounted || isGroup) return;

    if (message.length > 0) {
      socket.volatile.emit("messageTypingStart", { conversationId });
    } else {
      socket.volatile.emit("messageTypingStop", { conversationId });
    }
  }, [message]);

  useEffect(() => {
    setIsMounted(true);

    if (!conversationId) return;

    const checkScreenWidth = () => {
      if (window.innerWidth <= 768 && !isMobile) {
        setIsMobile(true);
      }

      if (window.innerWidth > 768 && isMobile) {
        setIsMobile(false);
      }
    };

    checkScreenWidth();

    window.addEventListener("resize", checkScreenWidth);

    return () => {
      window.removeEventListener("resize", checkScreenWidth);
    };
  }, []);

  return (
    <div className="flex w-full items-center justify-between gap-2 border-t p-4">
      <div className="flex">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
              <PlusCircleIcon size={20} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-full p-2">
            {message.trim() || isMobile ? (
              <div className="flex gap-2">
                <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
                  <MicIcon size={20} />
                </Button>
                <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
                  <FileImageIcon size={20} />
                </Button>
                <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
                  <PaperclipIcon size={20} />
                </Button>
              </div>
            ) : (
              <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
                <MicIcon size={20} />
              </Button>
            )}
          </PopoverContent>
        </Popover>
        {!message.trim() && !isMobile && (
          <div className="flex">
            <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
              <FileImageIcon size={20} />
            </Button>
            <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0">
              <PaperclipIcon size={20} />
            </Button>
          </div>
        )}
      </div>

      <AnimatePresence initial={false}>
        <motion.div
          key="input"
          className="relative w-full"
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: "spring",
              bounce: 0.15,
            },
          }}
        >
          <Input
            autoComplete="off"
            value={message}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={(e) => setMessage(e.target.value)}
            name="message"
            placeholder="Aa"
            className="h-9 w-full rounded-full border border-secondary-foreground pr-10"
          />
          <div className="absolute bottom-0.5 right-2">
            <EmojiPicker
              onChange={(value) => {
                setMessage(message + value);
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {message.trim() ? (
        <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0" onClick={handleSend}>
          <SendHorizonalIcon size={20} />
        </Button>
      ) : (
        <Button variant={"ghost"} size={"icon"} className="size-9 shrink-0" onClick={handleThumbsUp}>
          <ThumbsUpIcon size={20} />
        </Button>
      )}
    </div>
  );
}
