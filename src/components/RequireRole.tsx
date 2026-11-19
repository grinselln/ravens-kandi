import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "./Admin/Providers/AuthContext"

type Props = { admin?: boolean }

export const RequireRole = ({ admin }: Props) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null // or your spinner
  if (!user) return <Navigate to="/login" replace />
  if (admin && !isAdmin) return <Navigate to="/admin" replace />

  return <Outlet />
}