import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

// Types
export interface CreateRaffleRequest {
  title: string
  description?: string
  goalPacks: number
  startDate?: string
  endDate?: string
  status?: 'draft' | 'active' | 'sold_out' | 'closed' | 'drawn'
}

export interface UpdateRaffleRequest {
  title?: string
  description?: string
  goalPacks?: number
  startDate?: string
  endDate?: string
  status?: 'draft' | 'active' | 'sold_out' | 'closed' | 'drawn'
}

export interface UpdateRaffleStatusRequest {
  status: 'draft' | 'active' | 'sold_out' | 'closed' | 'drawn'
}

export interface RaffleWithStats {
  id: string
  title: string | null
  description: string | null
  goalPacks: number
  status: string
  startDate: string | null
  endDate: string | null
  createdAt: string
  updatedAt: string
  packsSold: number
  progressPercentage: number
  totalRevenue: number
}

export interface KpiData {
  totalSales: number
  packsSold: number
  activeUsers: number
  activeRaffles: number
  totalPurchases: number
  pendingPurchases: number
  completedPurchases: number
  totalLuckyPasses: number
  winnersCount: number
}

export interface UserWithStats {
  id: string
  email: string | null
  firstName: string | null
  lastName: string | null
  role: string
  status: string
  createdAt: string
  _count: {
    purchases: number
    luckyPasses: number
  }
}

export interface UsersResponse {
  users: UserWithStats[]
  total: number
  skip: number
  take: number
}

export interface UpdateUserRoleRequest {
  role: 'admin' | 'operator' | 'customer'
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'blocked'
}

// ==================== RIFAS ====================

export async function createRaffle(data: CreateRaffleRequest): Promise<RaffleWithStats> {
  return apiClient.post<RaffleWithStats>(ENDPOINTS.admin.raffles, data)
}

export async function getAllRaffles(): Promise<RaffleWithStats[]> {
  return apiClient.get<RaffleWithStats[]>(ENDPOINTS.admin.raffles)
}

export async function updateRaffle(raffleId: string, data: UpdateRaffleRequest): Promise<RaffleWithStats> {
  return apiClient.patch<RaffleWithStats>(ENDPOINTS.admin.raffle(raffleId), data)
}

export async function updateRaffleStatus(raffleId: string, data: UpdateRaffleStatusRequest): Promise<RaffleWithStats> {
  return apiClient.patch<RaffleWithStats>(ENDPOINTS.admin.raffleStatus(raffleId), data)
}

// ==================== KPIs ====================

export async function getKpis(): Promise<KpiData> {
  return apiClient.get<KpiData>(ENDPOINTS.admin.kpis)
}

// ==================== USUARIOS ====================

export async function getAllUsers(skip?: number, take?: number): Promise<UsersResponse> {
  const params = new URLSearchParams()
  if (skip !== undefined) params.append('skip', skip.toString())
  if (take !== undefined) params.append('take', take.toString())
  
  const query = params.toString()
  const url = query ? `${ENDPOINTS.admin.users}?${query}` : ENDPOINTS.admin.users
  
  return apiClient.get<UsersResponse>(url)
}

export async function updateUserRole(userId: string, data: UpdateUserRoleRequest): Promise<UserWithStats> {
  return apiClient.patch<UserWithStats>(ENDPOINTS.admin.userRole(userId), data)
}

export async function updateUserStatus(userId: string, data: UpdateUserStatusRequest): Promise<UserWithStats> {
  return apiClient.patch<UserWithStats>(ENDPOINTS.admin.userBlock(userId), data)
}
