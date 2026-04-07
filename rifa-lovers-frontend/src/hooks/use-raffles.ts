import { useState, useEffect } from 'react'
import { getActiveRaffle, getActiveRaffleProgress } from '@/api/raffles.api'
import type { Raffle, RaffleProgress } from '@/types/domain.types'

export function useActiveRaffle() {
  const [raffle, setRaffle] = useState<Raffle | null>(null)
  const [progress, setProgress] = useState<RaffleProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [raffleData, progressData] = await Promise.all([
          getActiveRaffle(),
          getActiveRaffleProgress(),
        ])
        setRaffle(raffleData)
        setProgress(progressData)
      } catch (err: any) {
        setError(err.message || 'Error al cargar rifa activa')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return { raffle, progress, isLoading, error }
}
