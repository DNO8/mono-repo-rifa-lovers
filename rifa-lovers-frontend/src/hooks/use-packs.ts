import { getPacks } from '@/api/packs.api'
import type { Pack } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function usePacks() {
  const { data: packs, isLoading, error } = useAsyncData<Pack[]>(getPacks, [], [], 'packs', 5 * 60 * 1000)
  return { packs, isLoading, error }
}
