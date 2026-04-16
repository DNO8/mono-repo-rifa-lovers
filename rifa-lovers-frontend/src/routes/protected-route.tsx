import { Navigate, useLocation } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/stores/auth.store'
import type { UserRole } from '@/types/domain.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: Extract<UserRole, 'admin' | 'operator'>
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, user: s.user }))
  )
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
