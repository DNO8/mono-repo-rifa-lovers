import { useState } from 'react'
import { useAsyncData } from '@/hooks/use-async-data'
import {
  getOperatorKpis,
  getOperatorRaffles,
  createOperatorRaffle,
  updateOperatorRaffle,
  updateOperatorRaffleStatus,
  getRafflePacks,
  createRafflePack,
  updatePack,
  deletePack,
  getOperatorParticipants,
  getOperatorDrawStatus,
  executeOperatorDraw,
  getOperatorNewsletterCampaigns,
  sendOperatorNewsletter,
  getOperatorOrganization,
  createOperatorOrganization,
  uploadRaffleCover,
} from '@/api/operator.api'
import type {
  OperatorKpiData,
  PackWithStats,
  CreatePackRequest,
  UpdatePackRequest,
  Participant,
  DrawStatusResponse,
  NewsletterCampaign,
  SendOperatorNewsletterRequest,
  SendOperatorNewsletterResponse,
  OrganizationData,
  CreateOrganizationRequest,
} from '@/api/operator.api'
import type { RaffleWithStats, CreateRaffleRequest, UpdateRaffleRequest, UpdateRaffleStatusRequest } from '@/api/admin.api'

export function useOperatorOrg() {
  const {
    data: org,
    isLoading,
    error,
    refresh,
  } = useAsyncData<OrganizationData | null>(
    async () => {
      try {
        return await getOperatorOrganization()
      } catch {
        return null
      }
    },
    null,
  )

  const create = async (data: CreateOrganizationRequest) => {
    const created = await createOperatorOrganization(data)
    refresh()
    return created
  }

  return { org, isLoading, error, refresh, create }
}

export function useOperatorKPIs() {
  const { data: kpis, isLoading, error, refresh } = useAsyncData<OperatorKpiData>(getOperatorKpis, {
    totalSales: 0,
    packsSold: 0,
    activeRaffles: 0,
    totalPurchases: 0,
    pendingPurchases: 0,
    completedPurchases: 0,
    failedPurchases: 0,
    totalLuckyPasses: 0,
    winnersCount: 0,
  })
  return { kpis, isLoading, error, refresh }
}

export function useOperatorRaffles() {
  const { data: raffles, isLoading, error, refresh } = useAsyncData<RaffleWithStats[]>(getOperatorRaffles, [])
  const [localRaffles, setLocalRaffles] = useState<RaffleWithStats[] | null>(null)
  const current = localRaffles ?? raffles

  const create = async (data: CreateRaffleRequest) => {
    const newRaffle = await createOperatorRaffle(data)
    setLocalRaffles(prev => [newRaffle, ...(prev ?? raffles)])
    return newRaffle
  }

  const update = async (raffleId: string, data: UpdateRaffleRequest) => {
    const updated = await updateOperatorRaffle(raffleId, data)
    setLocalRaffles(prev => (prev ?? raffles).map(r => r.id === raffleId ? updated : r))
    return updated
  }

  const updateStatus = async (raffleId: string, data: UpdateRaffleStatusRequest) => {
    const updated = await updateOperatorRaffleStatus(raffleId, data)
    setLocalRaffles(prev => (prev ?? raffles).map(r => r.id === raffleId ? updated : r))
    return updated
  }

  const handleRefresh = () => {
    setLocalRaffles(null)
    refresh()
  }

  return { raffles: current, isLoading, error, refresh: handleRefresh, create, update, updateStatus }
}

export function useOperatorPacks(raffleId: string) {
  const { data: packs, isLoading, error, refresh } = useAsyncData<PackWithStats[]>(
    () => (raffleId ? getRafflePacks(raffleId) : Promise.resolve([])),
    [],
    [raffleId],
  )

  const create = async (data: CreatePackRequest) => {
    if (!raffleId) throw new Error('Se requiere una rifa seleccionada para crear un pack')
    const newPack = await createRafflePack(raffleId, data)
    refresh()
    return newPack
  }

  const update = async (packId: string, data: UpdatePackRequest) => {
    const updated = await updatePack(packId, data)
    refresh()
    return updated
  }

  const remove = async (packId: string) => {
    await deletePack(packId)
    refresh()
  }

  return { packs, isLoading, error, refresh, create, update, remove }
}

export function useOperatorParticipants(raffleId: string) {
  const { data: participants, isLoading, error, refresh } = useAsyncData<Participant[]>(
    () => (raffleId ? getOperatorParticipants(raffleId) : Promise.resolve([])),
    [],
    [raffleId],
  )
  return { participants, isLoading, error, refresh }
}

export function useOperatorDraw(raffleId: string) {
  const { data: drawStatus, isLoading, error, refresh } = useAsyncData<DrawStatusResponse>(
    () => (raffleId ? getOperatorDrawStatus(raffleId) : Promise.resolve({ canExecute: false, results: null })),
    { canExecute: false, results: null },
    [raffleId],
  )

  const execute = async (prizeId?: string) => {
    if (!raffleId) throw new Error('Se requiere una rifa seleccionada para ejecutar el sorteo')
    const result = await executeOperatorDraw(raffleId, prizeId)
    refresh()
    return result
  }

  return { drawStatus, isLoading, error, refresh, execute }
}

export function useUploadRaffleCover() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const upload = async (raffleId: string, file: File) => {
    setIsUploading(true)
    setError(null)
    try {
      const result = await uploadRaffleCover(raffleId, file)
      return result.coverImageUrl
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error al subir la imagen'))
      throw err
    } finally {
      setIsUploading(false)
    }
  }

  return { upload, isUploading, error }
}

export function useOperatorNewsletter() {
  const { data: campaigns, isLoading, error, refresh } = useAsyncData<NewsletterCampaign[]>(
    getOperatorNewsletterCampaigns,
    [],
  )

  const send = async (data: SendOperatorNewsletterRequest): Promise<SendOperatorNewsletterResponse> => {
    const result = await sendOperatorNewsletter(data)
    refresh()
    return result
  }

  return { campaigns, isLoading, error, refresh, send }
}
