import { ApiError } from "@/api/errors";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface ISessionContext {
  isSessionExpired: boolean;
  triggerSessionExpired: () => void;
  dismissSessionExpired: () => void;
}

const SessionContext = createContext<ISessionContext | undefined>(undefined);

export const SessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if(error instanceof ApiError && error.status === 403) {
          triggerSessionExpired();
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if(error instanceof ApiError && error.status === 403) {
          triggerSessionExpired();
        }
      }
    })
  }));

  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const triggerSessionExpired = useCallback(() => {
    setIsSessionExpired(true)
  }, []);

  const dismissSessionExpired = useCallback(() => {
    setIsSessionExpired(false);
  }, [])

  const value = useMemo<ISessionContext>(() => ({
    isSessionExpired,
    triggerSessionExpired,
    dismissSessionExpired
  }), [isSessionExpired, triggerSessionExpired, dismissSessionExpired]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionContext.Provider value={value}>
        {children}
      </SessionContext.Provider>
    </QueryClientProvider>
  )
}

export const useSessionStore = (): ISessionContext => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessionStore must be used within SessionProvider");
  }
  return context;
};