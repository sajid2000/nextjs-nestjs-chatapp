import { AUTH_URI } from "@/lib/constants";

import AuthCard from "../_components/AuthCard";
import SignUpForm from "./RegisterForm";

const SignUpPage = () => {
  return (
    <AuthCard
      title="Sign Up"
      desc="Create an account"
      bottomButtonLabel="Already have an account?"
      bottomButtonHref={AUTH_URI.signIn}
    >
      <SignUpForm />
    </AuthCard>
  );
};

export default SignUpPage;
