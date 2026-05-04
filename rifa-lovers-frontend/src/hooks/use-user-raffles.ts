import { getUserRaffles } from '@/api/raffles.api'
import { useAuthStore } from '@/stores/auth.store'
import type { Raffle } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function useUserRaffles() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const userId = useAuthStore((s) => s.user?.id)

  const { data, isLoading, error, refresh } = useAsyncData<Raffle[]>(
    () => isAuthenticated ? getUserRaffles() : Promise.resolve([]),
    [],
    [isAuthenticated, userId],
  )
  return { raffles: data, isLoading, error, refresh }
}
