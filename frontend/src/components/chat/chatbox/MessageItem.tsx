import { CheckCircleIcon, CheckIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, formatTime } from "@/lib/utils";
import { IMessage } from "@/services/messageService";

type Props = {
  isGroup: boolean;
  own?: boolean;
  id: number;
  message: string;
  sentAt: Date;
  status: IMessage["messageStatus"];
  sender: IMessage["sender"];
};

const MessageItem: React.FC<Props> = ({ isGroup, own, message, status, sentAt, sender }) => {
  return (
    <div className={cn("flex flex-col gap-3 whitespace-pre-wrap p-4", own ? "items-end" : "items-start")}>
      {isGroup && (
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={sender.avatar ?? ""} />
            <AvatarFallback>{sender.fullName[0]}</AvatarFallback>
          </Avatar>
          {sender.fullName}
        </div>
      )}
      <span className={cn("max-w-[75%] rounded-lg p-3", own ? "bg-primary text-primary-foreground" : "bg-accent")}>
        {message}
        <p className="mt-1 flex items-center justify-end gap-1 text-xs">
          {formatTime(sentAt)}
          {!isGroup && (
            <>
              {own && status === "sent" && <CheckIcon size={16} />}
              {own && status === "delivered" && <CheckCircleIcon size={16} />}
              {own && status === "seen" && <CheckCircleIcon className="text-green-600" size={16} />}
            </>
          )}
        </p>
      </span>
    </div>
  );
};

export default MessageItem;
