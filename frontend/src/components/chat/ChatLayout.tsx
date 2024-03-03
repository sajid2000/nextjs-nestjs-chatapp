import { cn } from "@/lib/utils";

import ChatBox from "./chatbox/ChatBox";
import ConversationList from "./conversation/ConversationList";

interface Props {
  conversationId: string;
}

export default function ChatLayout({ conversationId }: Props) {
  return (
    <>
      <div
        className={cn("h-full min-w-64 overflow-y-auto border-r md:max-w-[300px] lg:max-w-[500px]", {
          "hidden md:block": !!conversationId,
          "max-w-auto grow": !conversationId,
        })}
      >
        <ConversationList />
      </div>
      <div
        className={cn("h-screen grow flex-col justify-between ", {
          flex: !!conversationId,
          "hidden md:flex": !conversationId,
        })}
      >
        {conversationId ? (
          <ChatBox />
        ) : (
          <div className="flex size-full flex-wrap items-center justify-center">Select a conversation to start chatting</div>
        )}
      </div>
    </>
  );
}
