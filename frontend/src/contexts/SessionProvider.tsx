"use client";

import { createContext, useContext } from "react";

import { AuthUser } from "@/types";

type ContextType = { user?: AuthUser | null };

const Context = createContext<ContextType>({});

type Props = React.PropsWithChildren<{ session: ContextType }>;

const SessionProvider: React.FC<Props> = ({ children, session }) => {
  return <Context.Provider value={session}>{children}</Context.Provider>;
};

export default SessionProvider;

export const useSession = () => useContext(Context);
