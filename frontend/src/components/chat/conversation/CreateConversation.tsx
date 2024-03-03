"use client";

import { UserPlusIcon, UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ContactList from "@/components/contact/ContactList";
import CreateContact from "@/components/contact/CreateContact";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import axios from "@/lib/axios";
import { useCreateConversation } from "@/services/conversationService";

type Props = {
  trigger: React.ReactNode;
};

const CreateConversation: React.FC<Props> = ({ trigger }) => {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const { mutateAsync: createConversation } = useCreateConversation();

  const handleStartConversation = async (contactId: number) => {
    try {
      await createConversation({ contactId, isGroup: false });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={"left"}>
        <SheetHeader>
          <SheetTitle>Start new conversation</SheetTitle>
        </SheetHeader>
        <div className="mt-10 space-y-2">
          <CreateContact
            trigger={
              <Button variant={"ghost"} className="h-12 w-full justify-start gap-4 px-2">
                <UserPlusIcon className="size-8 rounded-full bg-primary p-1 text-primary-foreground" /> New contact
              </Button>
            }
          />
          <Button variant={"ghost"} className="h-12 w-full justify-start gap-4 px-2">
            <UsersIcon className="size-8 rounded-full bg-primary p-1 text-primary-foreground" /> New group
          </Button>
        </div>
        <p className="mt-10 p-2">Contacts</p>
        <ContactList handleStartConversation={handleStartConversation} />
      </SheetContent>
    </Sheet>
  );
};

export default CreateConversation;
