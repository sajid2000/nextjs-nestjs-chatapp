"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

const OauthButton = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <>
      <div className="mb-6 grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link href="http://localhost:4000/auth/google">Google</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="http://localhost:4000/auth/github">Github</Link>
        </Button>
      </div>
      <p className="mb-6 text-center text-sm text-muted-foreground">OR CONTINUE WITH EMAIL</p>
    </>
  );
};

export default OauthButton;
