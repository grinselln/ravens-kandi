import { ApiError } from "@/api/errors";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { ISessionContext } from "./ISession";
import { SessionContext } from "./SessionContext";

export const SessionProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isSessionExpired, setIsSessionExpired] = useState<boolean>(false);

  const triggerSessionExpired = useCallback(() => {
    setIsSessionExpired(true)
  }, []);

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