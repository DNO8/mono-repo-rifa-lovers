import { useState, useEffect, useCallback } from 'react'
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
  type UserWithStats,
  type UsersResponse,
  type UpdateUserRoleRequest,
  type UpdateUserStatusRequest,
} from '@/api/admin.api'

// ==================== RIFAS ====================

export function useAdminRaffles() {
  const [raffles, setRaffles] = useState<RaffleWithStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRaffles = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getAllRaffles()
      setRaffles(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al cargar rifas')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRaffles()
  }, [fetchRaffles])

  const create = async (data: CreateRaffleRequest) => {
    const newRaffle = await createRaffle(data)
    setRaffles(prev => [newRaffle, ...prev])
    return newRaffle
  }

  const update = async (raffleId: string, data: UpdateRaffleRequest) => {
    const updated = await updateRaffle(raffleId, data)
    setRaffles(prev => prev.map(r => r.id === raffleId ? updated : r))
    return updated
  }

  const updateStatus = async (raffleId: string, data: UpdateRaffleStatusRequest) => {
    const updated = await updateRaffleStatus(raffleId, data)
    setRaffles(prev => prev.map(r => r.id === raffleId ? updated : r))
    return updated
  }

  return {
    raffles,
    isLoading,
    error,
    refresh: fetchRaffles,
    create,
    update,
    updateStatus,
  }
}

// ==================== KPIs ====================

export function useAdminKPIs() {
  const [kpis, setKpis] = useState<KpiData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchKpis = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getKpis()
      setKpis(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al cargar KPIs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchKpis()
  }, [fetchKpis])

  return {
    kpis,
    isLoading,
    error,
    refresh: fetchKpis,
  }
}

// ==================== USUARIOS ====================

export function useAdminUsers(initialSkip = 0, initialTake = 50) {
  const [usersData, setUsersData] = useState<UsersResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skip, setSkip] = useState(initialSkip)
  const [take, setTake] = useState(initialTake)

  const fetchUsers = useCallback(async (newSkip = skip, newTake = take) => {
    try {
      setIsLoading(true)
      const data = await getAllUsers(newSkip, newTake)
      setUsersData(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios')
    } finally {
      setIsLoading(false)
    }
  }, [skip, take])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const updateRole = async (userId: string, data: UpdateUserRoleRequest) => {
    const updated = await updateUserRole(userId, data)
    setUsersData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, role: updated.role } : u),
      }
    })
    return updated
  }

  const updateStatus = async (userId: string, data: UpdateUserStatusRequest) => {
    const updated = await updateUserStatus(userId, data)
    setUsersData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        users: prev.users.map(u => u.id === userId ? { ...u, status: updated.status } : u),
      }
    })
    return updated
  }

  const goToPage = (newSkip: number) => {
    setSkip(newSkip)
    fetchUsers(newSkip, take)
  }

  return {
    users: usersData?.users || [],
    total: usersData?.total || 0,
    skip,
    take,
    isLoading,
    error,
    refresh: () => fetchUsers(skip, take),
    updateRole,
    updateStatus,
    goToPage,
  }
}
