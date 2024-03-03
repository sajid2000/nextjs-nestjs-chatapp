"use client";

import { useRouter } from "next/navigation";

import LoginForm from "@/app/auth/sign-in/LoginForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AUTH_URI } from "@/lib/constants";

interface Props {
  children: React.ReactNode;
  mode?: "modal" | "redirect";
  asChild?: boolean;
}

export default function LoginButton({ children, mode = "redirect", asChild }: Props) {
  const router = useRouter();

  if (mode === "modal") {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className="w-auto border-none bg-transparent p-0">
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <span onClick={() => router.push(AUTH_URI.signIn)} className="cursor-pointer">
      {children}
    </span>
  );
}
