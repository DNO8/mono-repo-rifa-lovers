import { useState, useEffect } from 'react'
import { getMyPurchases } from '@/api/purchases.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Purchase } from '@/types/domain.types'

export function usePurchases() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }

    const fetchPurchases = async () => {
      try {
        setIsLoading(true)
        const data = await getMyPurchases()
        setPurchases(data)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar compras'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
  }, [isAuthenticated])

  return { purchases, isLoading, error }
}
