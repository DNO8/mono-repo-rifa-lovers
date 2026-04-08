import { PurchaseStatus } from '@prisma/client'

export class PurchaseEntity {
  id: string
  raffleId: string | null
  userId: string | null
  totalAmount: number | null
  status: PurchaseStatus
  createdAt: Date
  paidAt: Date | null

  constructor(partial: Partial<PurchaseEntity>) {
    Object.assign(this, partial)
  }

  isPending(): boolean {
    return this.status === 'pending'
  }

  isPaid(): boolean {
    return this.status === 'paid'
  }

  isFailed(): boolean {
    return this.status === 'failed'
  }

  isRefunded(): boolean {
    return this.status === 'refunded'
  }

  canBePaid(): boolean {
    return this.status === 'pending'
  }

  canBeRefunded(): boolean {
    return this.status === 'paid'
  }

  markAsPaid(): void {
    this.status = 'paid'
    this.paidAt = new Date()
  }

  markAsFailed(): void {
    this.status = 'failed'
  }

  markAsRefunded(): void {
    this.status = 'refunded'
  }
}
