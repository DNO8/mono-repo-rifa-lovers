import type { LuckyPass, Raffle } from '@prisma/client'
import type { LuckyPassResponseDto } from '../dto'

type LuckyPassWithRaffle = LuckyPass & { raffle: Raffle | null }

export function mapLuckyPassToDto(pass: LuckyPassWithRaffle): LuckyPassResponseDto {
  return {
    id: pass.id,
    ticketNumber: pass.ticketNumber || 0,
    status: pass.status,
    isWinner: pass.isWinner,
    raffleId: pass.raffleId || '',
    raffleName: pass.raffle?.title || 'Rifa sin nombre',
    createdAt: pass.createdAt.toISOString(),
  }
}
