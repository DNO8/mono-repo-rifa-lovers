import { useEffect } from 'react'
import { RouterProvider } from 'react-router'
import { router } from '@/routes/router'
import { useAuthStore } from '@/stores/auth.store'

function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const refreshUser = useAuthStore((s) => s.refreshUser)

  useEffect(() => {
    if (isAuthenticated) refreshUser()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return <RouterProvider router={router} />
}

export default App
