import { MoreVerticalIcon, Trash2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAlert } from "@/contexts/AlertProvider";
import { socket } from "@/lib/socket";
import { useContactInfo } from "@/services/contactService";
import { invalidateConversationList } from "@/services/conversationService";

import Loading from "../Loading";

type Props = {
  contactId: number;
  conversationId: number;
};

const ContactInfo: React.FC<Props> = ({ conversationId, contactId }) => {
  const router = useRouter();

  const { showAlert } = useAlert();
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useContactInfo(contactId);

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
          <SheetTitle>Contact Info</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <Loading />
        ) : (
          data && (
            <div className="space-y-6 divide-y">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="size-44">
                  <AvatarImage src={data.avatar ?? ""} alt="" />
                  <AvatarFallback>{data.fullName[0]}</AvatarFallback>
                </Avatar>
                <p>{data.fullName}</p>
                <p>Phone - {data.phone}</p>
              </div>
              <div className="pt-6">
                <Button
                  variant={"ghost"}
                  className="h-12 w-full items-center justify-start gap-4 text-red-500"
                  onClick={() => {
                    showAlert({
                      actionLabel: "Delete",
                      action: async () => leaveConversation(),
                    });

                    router.replace("/");
                  }}
                >
                  <Trash2Icon className="size-5" /> Delete Conversatoin
                </Button>
              </div>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ContactInfo;
