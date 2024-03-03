import { CheckCircledIcon } from "@radix-ui/react-icons";

interface Props {
  message?: string;
}

const FormSuccess = ({ message }: Props) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-500">
      <CheckCircledIcon className="size-4" />
      <p>{message}</p>
    </div>
  );
};

export default FormSuccess;
