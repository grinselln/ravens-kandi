import { type ReactNode } from "react"
import { useQuery } from "@tanstack/react-query"
import { AuthContext } from "./AuthContext"
import { getMe } from "@/api/auth"
import { ROLES } from "@/helpers/constants"

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const user = data ?? null

  return (
    <AuthContext.Provider value={{ user, isAdmin: user ? data.role === ROLES.ADMIN : false, loading: isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}