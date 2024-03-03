import { CheckCircleIcon, CheckIcon } from "lucide-react";

import { cn, formatTime } from "@/lib/utils";
import { IMessage } from "@/services/messageService";

type Props = {
  own?: boolean;
  id: number;
  message: string;
  sentAt: Date;
  status: IMessage["messageStatus"];
};

const MessageItem: React.FC<Props> = ({ own, message, status, sentAt }) => {
  return (
    <div className={cn("flex flex-col gap-2 whitespace-pre-wrap p-4", own ? "items-end" : "items-start")}>
      <span className="max-w-[75%] rounded-lg bg-accent p-3">
        {message}
        <p className="mt-1 flex items-center justify-end gap-1 text-xs">
          {formatTime(sentAt)}
          {own && status === "sent" && <CheckIcon size={16} />}
          {own && status === "delivered" && <CheckCircleIcon size={16} />}
          {own && status === "seen" && <CheckCircleIcon className="text-green-600" size={16} />}
        </p>
      </span>
    </div>
  );
};

export default MessageItem;
