"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import React from "react";

import axios from "@/lib/axios";
import { AUTH_URI } from "@/lib/constants";

import { Button } from "../ui/button";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const logout = async () => {
    await axios.post("auth/signout");

    router.push(AUTH_URI.signIn);
    router.refresh();
  };
  return (
    <Button title="Logout" variant={"ghost"} size={"icon"} onClick={logout}>
      <ExitIcon />
    </Button>
  );
};

export default LogoutButton;
