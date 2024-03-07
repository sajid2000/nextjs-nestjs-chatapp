import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "@/contexts/SessionProvider";
import { cn } from "@/lib/utils";
import { ConversationThread } from "@/services/conversationService";

type Props = {
  conversation: ConversationThread;
  active?: boolean;
};

const ConversationListItem: React.FC<Props> = ({ conversation, active }) => {
  const { user } = useSession();

  return (
    <Button asChild variant={active ? "secondary" : "ghost"} size={"lg"} className={cn("relative h-14 justify-start gap-2 px-2")}>
      <Link href={`/?conversation=${conversation.id}`}>
        <div className="relative">
          <Avatar className="flex size-12 items-center justify-center">
            <AvatarImage src={conversation.avatar ?? ""} alt={conversation.name} width={6} height={6} className="size-full " />
            <AvatarFallback>{conversation.name.slice(0, 1)}</AvatarFallback>
          </Avatar>
          {conversation.isOnline && <span className="absolute bottom-1 right-1 size-2 rounded-full bg-indigo-600"></span>}
        </div>
        <div className="overflow-hidden">
          <p className="text-lg">{conversation.name}</p>

          <p className="truncate text-sm text-muted-foreground">
            {user?.id === conversation?.lastMessage?.senderId && "You: "}
            {conversation.lastMessage?.messageContent ?? "Start a conversation"}
          </p>
        </div>
      </Link>
    </Button>
  );
};

export default ConversationListItem;
