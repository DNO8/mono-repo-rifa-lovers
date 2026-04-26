import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import { streamingService } from '@/services/streaming.service'
import type { RaffleDetails, CustomerDrawResult, CustomerDrawParticipant, LuckyPassSlot, AdminDrawStatus } from '@/types/streaming.types'
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
  executeDraw: (prizeId?: string) => Promise<CustomerDrawResult>
  resetDraw: () => Promise<void>
  luckyPassSlots: LuckyPassSlot[]
}

export function useStreaming(raffleId: string | undefined): StreamingState & StreamingActions {
  const user = useAuthStore(state => state.user)
  
  // Detect if user is admin or operator
  const isAdminOrOperator = user?.role === USER_ROLE.ADMIN || user?.role === USER_ROLE.OPERATOR

  const [state, setState] = useState<StreamingState>({
    raffle: null,
    participants: [],
    drawStatus: null,
    isLoadingRaffle: false,
    isLoadingParticipants: false,
    isLoadingDrawStatus: false,
    error: null,
  })

  const setLoading = (key: keyof Pick<StreamingState, 'isLoadingRaffle' | 'isLoadingParticipants' | 'isLoadingDrawStatus'>, value: boolean) => {
    setState(prev => ({ ...prev, [key]: value }))
  }

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }))
  }

  // Fetch raffle details
  const refreshRaffle = async () => {
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
  }

  // Fetch participants
  const refreshParticipants = async () => {
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
  }

  // Fetch draw status
  const refreshDrawStatus = async () => {
    if (!raffleId) return
    
    setLoading('isLoadingDrawStatus', true)
    
    try {
      const statusResponse = isAdminOrOperator
        ? await streamingService.getAdminDrawStatus(raffleId)
        : {
            canExecute: await streamingService.checkDrawAvailability(raffleId),
            results: null,
          }
      
      // Extract the canExecute object which contains canDraw, prizesCount, etc.
      setState(prev => ({ ...prev, drawStatus: statusResponse.canExecute }))
    } catch (err) {
      console.error('Error fetching draw status:', err)
      // Don't set error for draw status, just log it
    } finally {
      setLoading('isLoadingDrawStatus', false)
    }
  }

  // Execute draw for a specific prize or the next pending prize
  const executeDraw = async (prizeId?: string): Promise<CustomerDrawResult> => {
    if (!raffleId) throw new Error('No raffle ID provided')
    
    const result = isAdminOrOperator
      ? await streamingService.executeAdminDraw(raffleId, prizeId)
      : await streamingService.executeDraw(raffleId)
    
    // Do NOT refresh immediately - let the animation complete first
    // The component will call refreshDrawStatus after animation
    
    return result
  }

  // Reset draw (clear winners and allow re-draw)
  const resetDraw = async (): Promise<void> => {
    if (!raffleId) throw new Error('No raffle ID provided')
    if (!isAdminOrOperator) throw new Error('Only admin/operator can reset draw')
    
    await streamingService.resetAdminDraw(raffleId)
    
    // Refresh all data after reset
    await Promise.all([
      refreshRaffle(),
      refreshParticipants(),
      refreshDrawStatus()
    ])
  }

  // Transform participants into individual lucky pass slots for roulette
  const luckyPassSlots: LuckyPassSlot[] = (() => {
    const slots: LuckyPassSlot[] = []
    
    state.participants.forEach((participant) => {
      // Create a slot for each lucky pass the participant has
      participant.luckyPassIds.forEach((passId, index) => {
        // Get the ticket number from the passId (typically formatted like "raffleId-number")
        const passNumber = parseInt(passId.split('-').pop() || String(index + 1), 10) || index + 1
        
        const firstName = participant.firstName || ''
        const lastName = participant.lastName || ''
        const email = participant.email || ''
        
        slots.push({
          passId,
          passNumber,
          userId: participant.userId,
          userName: `${firstName} ${lastName}`.trim() || email || 'Usuario',
          userEmail: participant.email,
          userInitials: firstName && lastName 
            ? `${firstName[0]}${lastName[0]}`.toUpperCase()
            : firstName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || '?'
        })
      })
    })
    
    // Sort by pass number for consistent ordering
    return slots.sort((a, b) => a.passNumber - b.passNumber)
  })()

  // Initial fetch - use ref to track if we've already fetched
  const hasFetchedRef = useRef(false)
  
  useEffect(() => {
    if (raffleId && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      void refreshRaffle()
      void refreshParticipants()
      void refreshDrawStatus()
    }
  }, [raffleId])

  return {
    ...state,
    refreshRaffle,
    refreshParticipants,
    refreshDrawStatus,
    executeDraw,
    resetDraw,
    luckyPassSlots,
  }
}
