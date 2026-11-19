import { IUser } from "@/interfaces/IRecords"
import { createContext, useContext } from "react"

export type AuthState = {
  user: IUser | null
  isAdmin: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthState | null>(null)

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}