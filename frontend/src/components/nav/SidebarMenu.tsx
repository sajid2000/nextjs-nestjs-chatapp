import { MessageCircleMoreIcon, MessageSquarePlusIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

import CreateConversation from "../chat/conversation/CreateConversation";
import ThemeToggle from "../ThemeToggle";
import { Button } from "../ui/button";
import LogoutButton from "./LogoutButton";
import UserMenu from "./UserMenu";

type Props = {};

const SidebarMenu: React.FC = () => {
  return (
    <aside className="flex h-full flex-col items-center justify-between border-r bg-background p-4">
      <ul className="grid gap-2">
        <li>
          <Button variant={"ghost"} size={"icon"} asChild>
            <Link href="/">
              <MessageCircleMoreIcon />
            </Link>
          </Button>
        </li>
        <li>
          <CreateConversation
            trigger={
              <Button variant={"ghost"} size={"icon"}>
                <UsersIcon />
              </Button>
            }
          />
        </li>
        <li>
          <LogoutButton />
        </li>
      </ul>
      <div className="space-y-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </aside>
  );
};

export default SidebarMenu;
