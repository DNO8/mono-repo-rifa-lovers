import { getAdminDrawResults, type AdminDrawResults } from '@/api/draw.api'
import { useAsyncDataNullable } from './use-async-data-nullable'

export function useAdminDrawResults(raffleId: string | undefined) {
  const { data, isLoading, error, refresh } = useAsyncDataNullable<AdminDrawResults | null>(
    () => (raffleId ? getAdminDrawResults(raffleId) : Promise.resolve(null)),
    null,
  )

  return {
    results: data,
    isLoading,
    error,
    refresh,
  }
}
