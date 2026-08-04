import { useState, useEffect } from 'react'
import { getMe } from '../api/auth'

interface User {
  id: string
  username: string
  role: string
  created_at: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMe().then((data) => {
      setUser(data)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}