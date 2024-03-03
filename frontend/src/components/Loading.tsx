import { Loader2Icon } from "lucide-react";
import React from "react";

type Props = {
  className?: string;
};

const Loading: React.FC<Props> = ({ className }) => {
  return (
    <div className={className}>
      <Loader2Icon className="animate-spin" />
    </div>
  );
};

export default Loading;
