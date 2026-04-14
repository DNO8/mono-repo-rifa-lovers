import { RaffleStatus } from '@prisma/client'

export class RaffleEntity {
  id: string
  organizationId: string | null
  title: string | null
  description: string | null
  goalPacks: number
  maxTicketNumber: number
  status: RaffleStatus
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date

  constructor(partial: Partial<RaffleEntity>) {
    Object.assign(this, partial)
  }

  isActive(): boolean {
    return this.status === 'active'
  }

  isDraft(): boolean {
    return this.status === 'draft'
  }

  isSoldOut(): boolean {
    return this.status === 'sold_out'
  }

  isClosed(): boolean {
    return this.status === 'closed'
  }

  isDrawn(): boolean {
    return this.status === 'drawn'
  }

  canBeActivated(): boolean {
    return this.status === 'draft'
  }

  canAcceptPurchases(): boolean {
    return this.status === 'active'
  }
}
