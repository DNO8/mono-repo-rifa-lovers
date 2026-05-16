import { useState, useMemo, useCallback, type ReactNode } from 'react'
import { usePublicRaffles } from '@/hooks/use-raffles'
import { useAsyncData } from '@/hooks/use-async-data'
import { getRafflePacks, getRaffleProgress } from '@/api/raffles.api'
import { getPacks } from '@/api/packs.api'
import type { RaffleProgress, Pack } from '@/types/domain.types'
import { SelectedRaffleContext } from './selected-raffle.context'

export function SelectedRaffleProvider({ children }: { children: ReactNode }) {
  const { raffles: allRaffles, isLoading: rafflesLoading } = usePublicRaffles()

  const initialRaffleId = useMemo(() => {
    if (allRaffles.length === 0) return null
    const active = allRaffles.find(r => r.status === 'active')
    return active?.id ?? allRaffles[0]?.id ?? null
  }, [allRaffles])

  const [selectedRaffleId, setSelectedRaffleId] = useState<string | null>(null)

  const effectiveRaffleId = selectedRaffleId ?? initialRaffleId

  const raffle = useMemo(() => {
    if (!effectiveRaffleId) return null
    return allRaffles.find(r => r.id === effectiveRaffleId) ?? null
  }, [allRaffles, effectiveRaffleId])

  const packsFetcher = useCallback(async () => {
    if (!effectiveRaffleId) return [] as Pack[]
    const rafflePacks = await getRafflePacks(effectiveRaffleId)
    if (rafflePacks.length > 0) return rafflePacks
    // Fallback: usar packs globales (One, Flow, Max)
    const allPacks = await getPacks()
    const fallbackNames = ['One', 'Flow', 'Max']
    return allPacks.filter((p) => fallbackNames.includes(p.name ?? ''))
  }, [effectiveRaffleId])

  const progressFetcher = useCallback(() => {
    if (!effectiveRaffleId) return Promise.resolve(null as RaffleProgress | null)
    return getRaffleProgress(effectiveRaffleId)
  }, [effectiveRaffleId])

  const {
    data: packs,
    isLoading: packsLoading,
    error: packsError,
  } = useAsyncData(packsFetcher, [] as Pack[], [effectiveRaffleId])

  const {
    data: progress,
    isLoading: progressLoading,
    error: progressError,
  } = useAsyncData(progressFetcher, null as RaffleProgress | null, [effectiveRaffleId])

  const isLoading = rafflesLoading || packsLoading || progressLoading
  const error = packsError || progressError

  const value = useMemo(
    () => ({
      selectedRaffleId: effectiveRaffleId,
      setSelectedRaffleId,
      raffle,
      progress,
      packs,
      isLoading,
      error,
      allRaffles,
    }),
    [effectiveRaffleId, setSelectedRaffleId, raffle, progress, packs, isLoading, error, allRaffles],
  )

  return (
    <SelectedRaffleContext.Provider value={value}>
      {children}
    </SelectedRaffleContext.Provider>
  )
}
