"use client";

import React from "react";

import { useContactList } from "@/services/contactService";

import Loading from "../Loading";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

type Props = {
  handleStartConversation: (contactId: number) => void;
};

const ContactList: React.FC<Props> = ({ handleStartConversation }) => {
  const { data, isLoading } = useContactList();

  if (isLoading) return <Loading />;

  if (!data) return null;

  return (
    <ul>
      {data.map((contact) => (
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
  );
};

export default ContactList;
