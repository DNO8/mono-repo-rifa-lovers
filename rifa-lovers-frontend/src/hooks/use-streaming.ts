import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { streamingService, type AdminDrawStatus } from '@/services/streaming.service'
import type { RaffleDetails, CustomerDrawResult, CustomerDrawParticipant } from '@/types/streaming.types'
import { USER_ROLE } from '@/types/domain.types'

interface StreamingState {
  raffle: RaffleDetails | null
  participants: CustomerDrawParticipant[]
  drawStatus: AdminDrawStatus | null
  isLoadingRaffle: boolean
  isLoadingParticipants: boolean
  isLoadingDrawStatus: boolean
  error: string | null
}

interface StreamingActions {
  refreshRaffle: () => Promise<void>
  refreshParticipants: () => Promise<void>
  refreshDrawStatus: () => Promise<void>
  executeDraw: () => Promise<CustomerDrawResult>
}

export function useStreaming(raffleId: string | undefined): StreamingState & StreamingActions {
  const user = useAuthStore(state => state.user)
  
  // Detect if user is admin or operator
  const isAdminOrOperator = useMemo(() => {
    if (!user) return false
    return user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.OPERATOR
  }, [user])

  const [state, setState] = useState<StreamingState>({
    raffle: null,
    participants: [],
    drawStatus: null,
    isLoadingRaffle: false,
    isLoadingParticipants: false,
    isLoadingDrawStatus: false,
    error: null,
  })

  const setLoading = useCallback((key: keyof Pick<StreamingState, 'isLoadingRaffle' | 'isLoadingParticipants' | 'isLoadingDrawStatus'>, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  // Fetch raffle details
  const refreshRaffle = useCallback(async () => {
    if (!raffleId) return
    
    setLoading('isLoadingRaffle', true)
    setError(null)
    
    try {
      const raffle = isAdminOrOperator
        ? await streamingService.getAdminRaffle(raffleId)
        : await streamingService.getRaffle(raffleId)
      
      setState(prev => ({ ...prev, raffle }))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar la rifa'
      setError(message)
      console.error('Error fetching raffle:', err)
    } finally {
      setLoading('isLoadingRaffle', false)
    }
  }, [raffleId, isAdminOrOperator, setLoading, setError])

  // Fetch participants
  const refreshParticipants = useCallback(async () => {
    if (!raffleId) return
    
    setLoading('isLoadingParticipants', true)
    
    try {
      let participants: CustomerDrawParticipant[]
      
      if (isAdminOrOperator) {
        // Get admin participants and convert to CustomerDrawParticipant format
        const adminParticipants = await streamingService.getAdminParticipants(raffleId)
        participants = adminParticipants.map((p: { id: string; name: string; email: string; ticketCount: number; tickets: number[] }) => ({
          userId: p.id,
          firstName: p.name.split(' ')[0] ?? null,
          lastName: p.name.split(' ').slice(1).join(' ') || null,
          email: p.email,
          ticketCount: p.ticketCount,
          luckyPassIds: p.tickets.map(String),
        }))
      } else {
        participants = [] // Customers don't have access to participants list
      }
      
      setState(prev => ({ ...prev, participants }))
    } catch (err) {
      console.error('Error fetching participants:', err)
      // Don't set error for participants, just log it
    } finally {
      setLoading('isLoadingParticipants', false)
    }
  }, [raffleId, isAdminOrOperator, setLoading])

  // Fetch draw status
  const refreshDrawStatus = useCallback(async () => {
    if (!raffleId) return
    
    setLoading('isLoadingDrawStatus', true)
    
    try {
      const drawStatus = isAdminOrOperator
        ? await streamingService.getAdminDrawStatus(raffleId)
        : await streamingService.checkDrawAvailability(raffleId).then(availability => ({
            canExecute: availability.canDraw,
            results: null,
          }))
      
      setState(prev => ({ ...prev, drawStatus }))
    } catch (err) {
      console.error('Error fetching draw status:', err)
      // Don't set error for draw status, just log it
    } finally {
      setLoading('isLoadingDrawStatus', false)
    }
  }, [raffleId, isAdminOrOperator, setLoading])

  // Execute draw
  const executeDraw = useCallback(async (): Promise<CustomerDrawResult> => {
    if (!raffleId) throw new Error('No raffle ID provided')
    
    const result = isAdminOrOperator
      ? await streamingService.executeAdminDraw(raffleId)
      : await streamingService.executeDraw(raffleId)
    
    // Refresh draw status after execution
    await refreshDrawStatus()
    
    return result
  }, [raffleId, isAdminOrOperator, refreshDrawStatus])

  // Initial fetch - use ref to track if we've already fetched
  const hasFetchedRef = useRef(false)
  
  useEffect(() => {
    if (raffleId && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      void refreshRaffle()
      void refreshParticipants()
      void refreshDrawStatus()
    }
  }, [raffleId, refreshRaffle, refreshParticipants, refreshDrawStatus])

  return {
    ...state,
    refreshRaffle,
    refreshParticipants,
    refreshDrawStatus,
    executeDraw,
  }
}
