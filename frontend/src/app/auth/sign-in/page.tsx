import LoginForm from "@/app/auth/sign-in/LoginForm";
import { AUTH_URI } from "@/lib/constants";

import AuthCard from "../_components/AuthCard";

const LoginPage = () => {
  return (
    <AuthCard
      title="Sign In"
      desc="Choose your preferred sign in method"
      bottomButtonLabel="Don't have an account?"
      bottomButtonHref={AUTH_URI.signUp}
    >
      <LoginForm />
    </AuthCard>
  );
};

export default LoginPage;
