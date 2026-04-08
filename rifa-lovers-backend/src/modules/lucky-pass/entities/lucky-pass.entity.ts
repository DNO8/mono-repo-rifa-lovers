import { LuckyPassStatus } from '@prisma/client'

export class LuckyPassEntity {
  id: string
  raffleId: string | null
  userId: string | null
  userPackId: string | null
  ticketNumber: number | null
  status: LuckyPassStatus
  isWinner: boolean
  createdAt: Date

  constructor(partial: Partial<LuckyPassEntity>) {
    Object.assign(this, partial)
  }

  isActive(): boolean {
    return this.status === 'active'
  }

  isUsed(): boolean {
    return this.status === 'used'
  }

  isWinnerStatus(): boolean {
    return this.status === 'winner'
  }

  isCancelled(): boolean {
    return this.status === 'cancelled'
  }

  canBeUsed(): boolean {
    return this.status === 'active'
  }

  canWinPrize(): boolean {
    return this.status === 'active' && !this.isWinner
  }

  markAsUsed(): void {
    this.status = 'used'
  }

  markAsWinner(): void {
    this.isWinner = true
    this.status = 'winner'
  }

  markAsCancelled(): void {
    this.status = 'cancelled'
  }
}
