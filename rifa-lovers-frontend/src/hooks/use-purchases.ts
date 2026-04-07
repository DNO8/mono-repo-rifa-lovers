import { useState, useEffect } from 'react'
import { getMyPurchases } from '@/api/purchases.api'
import type { Purchase } from '@/types/domain.types'

export function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPurchases = async () => {
      try {
        setIsLoading(true)
        const data = await getMyPurchases()
        setPurchases(data)
      } catch (err: any) {
        setError(err.message || 'Error al cargar compras')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPurchases()
  }, [])

  return { purchases, isLoading, error }
}
