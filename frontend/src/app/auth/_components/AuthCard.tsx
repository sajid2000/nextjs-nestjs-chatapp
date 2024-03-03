import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import OauthButton from "./OauthButton";

interface Props {
  children: React.ReactNode;
  title: string;
  desc?: string;
  bottomButtonLabel: string;
  bottomButtonHref: string;
  showOauth?: boolean;
}

const AuthCard: React.FC<Props> = ({ children, title, desc, showOauth, bottomButtonHref, bottomButtonLabel }) => {
  return (
    <Card className="mx-2 w-full sm:w-auto sm:min-w-[400px]">
      <CardHeader className="items-center">
        <CardTitle>{title}</CardTitle>
        {desc && <CardDescription>{desc}</CardDescription>}
      </CardHeader>
      <CardContent>
        {showOauth && <OauthButton />}
        {children}
      </CardContent>
      <CardFooter>
        <Button asChild size="sm" variant="link" className="mx-auto p-0">
          <Link href={bottomButtonHref}>{bottomButtonLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AuthCard;
