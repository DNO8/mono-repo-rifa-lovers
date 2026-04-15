import { getPacks } from '@/api/packs.api'
import type { Pack } from '@/types/domain.types'
import { useAsyncData } from './use-async-data'

export function usePacks() {
  const { data: packs, isLoading, error } = useAsyncData<Pack[]>(getPacks, [])
  return { packs, isLoading, error }
}
