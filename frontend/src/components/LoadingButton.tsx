import { VariantProps } from "class-variance-authority";
import { Loader2Icon } from "lucide-react";

import { Button, buttonVariants } from "./ui/button";

type Props = {
  loading: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const LoadingButton: React.FC<Props> = ({ loading, children, className, ...props }) => {
  return (
    <Button disabled={loading} className={className} {...props}>
      {loading && <Loader2Icon className="mr-2 animate-spin" />}
      {children}
    </Button>
  );
};

export default LoadingButton;
