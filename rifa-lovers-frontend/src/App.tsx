import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { router } from '@/routes/router'
import { useAuthStore } from '@/stores/auth.store'
import { isTokenExpired } from '@/lib/jwt'
import { ChunkErrorBoundary } from '@/components/shared/chunk-error-boundary'

function App() {
  const { isAuthenticated, refreshUser, token } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, refreshUser: s.refreshUser, token: s.token }))
  )

  useEffect(() => {
    if (isAuthenticated) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) return
    const check = () => {
      if (isTokenExpired(token)) {
        useAuthStore.getState().logout()
        window.location.replace('/login')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated, token])

  return (
    <ChunkErrorBoundary>
      <RouterProvider router={router} />
    </ChunkErrorBoundary>
  )
}

export default App
