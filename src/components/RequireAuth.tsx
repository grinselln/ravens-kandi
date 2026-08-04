import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

export default RequireAuth