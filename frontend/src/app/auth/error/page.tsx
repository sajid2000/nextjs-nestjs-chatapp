import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

import AuthCard from "@/app/auth/_components/AuthCard";
import { AUTH_URI } from "@/lib/constants";

const AuthErrorPage = () => {
  return (
    <AuthCard title="Oops! Something went wrong!" bottomButtonHref={AUTH_URI.signIn} bottomButtonLabel="Back to login">
      <div className="flex w-full items-center justify-center">
        <ExclamationTriangleIcon className="size-20 text-destructive" />
      </div>
    </AuthCard>
  );
};

export default AuthErrorPage;
