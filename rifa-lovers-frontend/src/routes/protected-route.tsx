import { Navigate, useLocation } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useAuthStore } from '@/stores/auth.store'
import { isTokenExpired } from '@/lib/jwt'
import type { UserRole } from '@/types/domain.types'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ children, requiredRole, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, user: s.user, token: s.token }))
  )
  const location = useLocation()

  if (!isAuthenticated || isTokenExpired(token)) {
    if (isAuthenticated && isTokenExpired(token)) {
      useAuthStore.getState().logout()
    }
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
