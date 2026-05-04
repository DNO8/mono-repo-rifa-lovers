import { getMyPurchases } from '@/api/purchases.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Purchase } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function usePurchases() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)

  const { data: purchases, isLoading, error } = useAsyncData<Purchase[]>(
    () => isAuthenticated ? getMyPurchases() : Promise.resolve([]),
    [],
    [isAuthenticated, userId],
  )

  return { purchases, isLoading, error }
}
