import { createContext, useContext } from "react";
import { ISessionContext } from "./ISession";

export const SessionContext = createContext<ISessionContext | undefined>(undefined);

export const useSessionStore = (): ISessionContext => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionStore must be used within SessionProvider");
  }
  return context;
};