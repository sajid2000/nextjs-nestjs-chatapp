import { DotsVerticalIcon, ExitIcon } from "@radix-ui/react-icons";
import { MoreVerticalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAlert } from "@/contexts/AlertProvider";
import { useSession } from "@/contexts/SessionProvider";
import { socket } from "@/lib/socket";
import { invalidateConversationList, useDeleteGroup, useGroupConversationInfo } from "@/services/conversationService";

import Loading from "../Loading";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

type Props = {
  conversationId: number;
};

const GroupInfo: React.FC<Props> = ({ conversationId }) => {
  const router = useRouter();

  const { showAlert } = useAlert();
  const { user } = useSession();
  const { data: group, isLoading } = useGroupConversationInfo(conversationId);
  const { mutateAsync: deleteGroup } = useDeleteGroup();

  const [open, setOpen] = useState(false);

  const kickMember = (memberId: number) => {
    socket.emit("kickGroupMember", { conversationId, memberId });
  };

  const leaveConversation = () => {
    socket.volatile.emit("leaveConversation", { conversationId });

    router.replace("/");

    invalidateConversationList();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size={"icon"} variant={"secondary"} className="rounded-full">
          <MoreVerticalIcon />
        </Button>
      </SheetTrigger>
      <SheetContent side={"right"} className="space-y-2 p-0">
        <SheetHeader className="p-5">
          <SheetTitle>Group Info</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <Loading />
        ) : (
          group && (
            <div className="space-y-6 divide-y">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-44">
                  <AvatarImage src={group.image ?? ""} alt="" />
                  <AvatarFallback>{group.name[0]}</AvatarFallback>
                </Avatar>
                <p>{group.name}</p>
                <p>Group - {group.members.length} members</p>
              </div>
              <div className="pt-6">
                {user?.id === group.creator ? (
                  <>
                    <Button variant={"ghost"} className="h-12 w-full items-center justify-start gap-4">
                      <PencilIcon className="size-5" /> Edit Group
                    </Button>
                    <Button
                      variant={"ghost"}
                      className="h-12 w-full items-center justify-start gap-4 text-red-500"
                      onClick={() => {
                        showAlert({
                          actionLabel: "Delete",
                          action: async () => {
                            await deleteGroup({ groupId: group.id });
                            router.push("/");
                          },
                        });
                      }}
                    >
                      <Trash2Icon className="size-5" /> Delete Group
                    </Button>
                  </>
                ) : (
                  <Button
                    variant={"ghost"}
                    className="h-12 w-full items-center justify-start gap-4 text-red-500"
                    onClick={() => {
                      showAlert({
                        actionLabel: "Leave",
                        action: async () => leaveConversation(),
                      });
                    }}
                  >
                    <ExitIcon className="size-5" /> Leave Group
                  </Button>
                )}
              </div>
              <div className="pt-6">
                <p className="px-6 py-2">Members</p>
                <ul>
                  {group.members.map((member) => (
                    <li key={member.id} className="flex items-center gap-2 p-2 hover:bg-muted/40">
                      <Avatar className="size-12">
                        <AvatarImage src={member.avatar ?? ""} alt="" />
                        <AvatarFallback>{member.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="w-full space-y-2">
                        <div className="flex w-full items-center justify-between gap-2 overflow-hidden">
                          <p className="truncate text-lg">{member.id === user?.id ? "You" : member.fullName}</p>
                          {member.id === group.creator && (
                            <p className="rounded-full bg-primary p-0.5 text-xs text-primary-foreground">Admin</p>
                          )}
                        </div>
                        <p className="text-muted-foreground">{member.phone}</p>
                      </div>
                      {user?.id === group.creator && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size={"icon"} variant={"ghost"}>
                              <DotsVerticalIcon />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => kickMember(member.id)}>
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
};

export default GroupInfo;
