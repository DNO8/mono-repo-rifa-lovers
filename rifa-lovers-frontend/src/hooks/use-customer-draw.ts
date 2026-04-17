import { useState } from 'react'
import { useAsyncDataNullable } from './use-async-data-nullable'
import type { CustomerDrawAvailability, CustomerDrawResult } from '@/types/streaming.types'
import { streamingService } from '@/services/streaming.service'

// Dependency injection ready hook
export function createUseCustomerDraw(service: typeof streamingService = streamingService) {
  return function useCustomerDraw(raffleId: string) {
    const [isExecuting, setIsExecuting] = useState(false)
    
    const checkAvailability = async (): Promise<CustomerDrawAvailability> => {
      return service.checkDrawAvailability(raffleId)
    }

    const { data, isLoading, error, refresh } = useAsyncDataNullable<CustomerDrawAvailability | null>(
      checkAvailability,
      null,
    )

    const executeDraw = async (): Promise<CustomerDrawResult> => {
      setIsExecuting(true)
      try {
        const result = await service.executeDraw(raffleId)
        // Refrescar disponibilidad después del sorteo
        await refresh()
        return result
      } finally {
        setIsExecuting(false)
      }
    }

    return {
      availability: data,
      isLoading,
      error,
      isExecuting,
      checkAvailability: refresh,
      executeDraw,
    }
  }
}

// Default export with singleton service
export const useCustomerDraw = createUseCustomerDraw()
