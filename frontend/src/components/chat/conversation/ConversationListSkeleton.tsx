import { MoreHorizontalIcon, SquarePenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/Skeleton";

const ConversationListSkeleton = () => {
  return (
    <div className="space-y-4 overflow-auto p-2">
      <div className="flex items-center justify-between p-2">
        <div className="flex items-center gap-2 text-2xl">
          <p className="font-medium">Chats</p>
          <span className=""></span>
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
      <nav className={"flex flex-col gap-4"}>
        {[1, 2, 3, 4, 5].map((count) => (
          <div key={count} className="flex w-full items-center gap-2 px-2 py-1">
            <Skeleton className="size-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default ConversationListSkeleton;
