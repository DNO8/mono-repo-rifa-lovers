import { useAsyncDataNullable } from './use-async-data-nullable'
import type { RaffleDetails } from '@/types/streaming.types'
import { streamingService } from '@/services/streaming.service'

// Dependency injection ready hook
export function createUseCustomerRaffle(service: typeof streamingService = streamingService) {
  return function useCustomerRaffle(raffleId: string) {
    const { data, isLoading, error, refresh } = useAsyncDataNullable<RaffleDetails | null>(
      () => service.getRaffle(raffleId),
      null,
    )
    
    return { raffle: data, isLoading, error, refresh }
  }
}

// Default export with singleton service
export const useCustomerRaffle = createUseCustomerRaffle()
