import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";

import LoadingButton from "@/components/LoadingButton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Alert = {
  title?: string;
  description?: string;
  action: () => Promise<void>;
  actionLabel: string;
};

type ContextType = {
  showAlert: (payload: Alert) => void;
};

const Context = createContext<ContextType>({
  showAlert: () => {},
});

export const useAlert = () => useContext(Context);

const AlertProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [alertState, setAlertState] = useState<Alert>({
    action: async () => {},
    actionLabel: "Confirm",
  });
  const [openAlert, setOpenAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (payload: Alert) => {
    setAlertState(payload);
    setOpenAlert(true);
  };

  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  return (
    <Context.Provider value={{ showAlert }}>
      <AlertDialog open={openAlert} onOpenChange={setOpenAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertState.title ?? "Are you sure?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertState?.description ??
                "This action cannot be undone. This preset will no longer be accessible by you or others"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="m-0">Cancel</AlertDialogCancel>
            <LoadingButton
              type="button"
              loading={isLoading}
              variant="destructive"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  await alertState?.action();
                } catch (error) {
                  console.log(error);
                } finally {
                  setOpenAlert(false);
                  setIsLoading(false);
                }
              }}
            >
              <span className="text-destructive-foreground">{alertState?.actionLabel}</span>
            </LoadingButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {children}
    </Context.Provider>
  );
};

export default AlertProvider;
