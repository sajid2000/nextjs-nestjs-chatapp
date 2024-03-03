import React from "react";

import getServerUser from "@/lib/getServerUser";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const UserMenu: React.FC = async () => {
  const user = await getServerUser();

  return (
    <div>
      <Avatar>
        <AvatarImage src={user?.avatar ?? ""} alt="" height={100} width={100}></AvatarImage>
        <AvatarFallback>{user?.fullName.slice(0, 1)}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default UserMenu;
