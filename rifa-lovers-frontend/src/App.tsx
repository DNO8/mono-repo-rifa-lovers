import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { router } from '@/routes/router'
import { useAuthStore } from '@/stores/auth.store'
import { ChunkErrorBoundary } from '@/components/shared/chunk-error-boundary'

function App() {
  const { isAuthenticated, refreshUser } = useAuthStore(
    useShallow((s) => ({ isAuthenticated: s.isAuthenticated, refreshUser: s.refreshUser }))
  )

  useEffect(() => {
    if (isAuthenticated) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ChunkErrorBoundary>
      <RouterProvider router={router} />
    </ChunkErrorBoundary>
  )
}

export default App
