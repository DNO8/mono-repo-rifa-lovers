import { getMyPurchases } from '@/api/purchases.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Purchase } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function usePurchases() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: purchases, isLoading, error } = useAsyncData<Purchase[]>(
    () => isAuthenticated ? getMyPurchases() : Promise.resolve([]),
    [],
    [isAuthenticated],
  )

  return { purchases, isLoading, error }
}
