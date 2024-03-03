import { Skeleton } from "@/components/ui/Skeleton";

const MessageSkeleton = () => {
  return (
    <div className="space-y-8 p-4">
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-2/4" />
        <Skeleton className="h-9 w-3/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-4/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-4/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-3/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-4/5" />
        <Skeleton className="h-9 w-3/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-3/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-4/5" />
      </div>
      <div className="flex w-3/4 flex-col space-y-8 odd:ml-auto odd:items-end">
        <Skeleton className="h-9 w-4/5" />
      </div>
    </div>
  );
};

export default MessageSkeleton;
