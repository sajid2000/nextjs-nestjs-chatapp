"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import CreateContact from "@/components/chat/conversation/CreateContact";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ApplicationError } from "@/lib/errors";
import { socket } from "@/lib/socket";
import { useContactList } from "@/services/contactService";
import { usePrivateConversationByContact } from "@/services/conversationService";

type Props = {
  trigger: React.ReactNode;
};

const CreateConversation: React.FC<Props> = ({ trigger }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data } = useContactList();
  const { mutateAsync: getPrivateConversationByContact } = usePrivateConversationByContact();

  const handleStartConversation = async (contactId: number) => {
    try {
      const exist = await getPrivateConversationByContact(contactId);

      router.push(`/?conversation=${exist.data.id}`);
    } catch (error) {
      if (error instanceof ApplicationError && error.statusCode === 404) {
        socket.volatile.emit("createPrivateConversation", { contactId });
      }
    } finally {
      setOpen(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={"left"} className="space-y-2">
        <SheetHeader>
          <SheetTitle>Start new conversation</SheetTitle>
        </SheetHeader>
        <div className="space-y-2">
          <CreateContact />
        </div>
        <p className="p-2">Contacts</p>
        <ul>
          {data?.map((contact) => (
            <li
              role="button"
              key={contact.id}
              className="flex w-full items-center gap-4 rounded-md p-2 hover:bg-accent/40"
              onClick={() => handleStartConversation(contact.id)}
            >
              <Avatar>
                <AvatarImage src={contact.avatar ?? ""} alt="" className="size-12" />
                <AvatarFallback>{contact.fullName.slice(0, 1)}</AvatarFallback>
              </Avatar>
              <p>{contact.fullName}</p>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
};

export default CreateConversation;
