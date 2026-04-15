import { useState } from 'react'
import {
  getAllRaffles,
  createRaffle,
  updateRaffle,
  updateRaffleStatus,
  getKpis,
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  type CreateRaffleRequest,
  type UpdateRaffleRequest,
  type UpdateRaffleStatusRequest,
  type RaffleWithStats,
  type KpiData,
  type UsersResponse,
  type UpdateUserRoleRequest,
  type UpdateUserStatusRequest,
} from '@/api/admin.api'
import { useAsyncData } from '../../../hooks/use-async-data'

// ==================== RIFAS ====================

export function useAdminRaffles() {
  const { data: raffles, isLoading, error, refresh } = useAsyncData<RaffleWithStats[]>(getAllRaffles, [])

  const [localRaffles, setLocalRaffles] = useState<RaffleWithStats[] | null>(null)
  const current = localRaffles ?? raffles

  const create = async (data: CreateRaffleRequest) => {
    const newRaffle = await createRaffle(data)
    setLocalRaffles(prev => [newRaffle, ...(prev ?? raffles)])
    return newRaffle
  }

  const update = async (raffleId: string, data: UpdateRaffleRequest) => {
    const updated = await updateRaffle(raffleId, data)
    setLocalRaffles(prev => (prev ?? raffles).map(r => r.id === raffleId ? updated : r))
    return updated
  }

  const updateStatus = async (raffleId: string, data: UpdateRaffleStatusRequest) => {
    const updated = await updateRaffleStatus(raffleId, data)
    setLocalRaffles(prev => (prev ?? raffles).map(r => r.id === raffleId ? updated : r))
    return updated
  }

  const handleRefresh = () => {
    setLocalRaffles(null)
    refresh()
  }

  return { raffles: current, isLoading, error, refresh: handleRefresh, create, update, updateStatus }
}

// ==================== KPIs ====================

export function useAdminKPIs() {
  const { data: kpis, isLoading, error, refresh } = useAsyncData<KpiData | null>(getKpis, null)
  return { kpis, isLoading, error, refresh }
}

// ==================== USUARIOS ====================

export function useAdminUsers(initialSkip = 0, initialTake = 50) {
  const [skip, setSkip] = useState(initialSkip)
  const take = initialTake

  const { data: usersData, isLoading, error, refresh } = useAsyncData<UsersResponse | null>(
    () => getAllUsers(skip, take),
    null,
    [skip, take],
  )

  const updateRole = async (userId: string, data: UpdateUserRoleRequest) => {
    return updateUserRole(userId, data)
  }

  const updateStatus = async (userId: string, data: UpdateUserStatusRequest) => {
    return updateUserStatus(userId, data)
  }

  const goToPage = (newSkip: number) => setSkip(newSkip)

  return {
    users: usersData?.users ?? [],
    total: usersData?.total ?? 0,
    skip,
    take,
    isLoading,
    error,
    refresh,
    updateRole,
    updateStatus,
    goToPage,
  }
}
