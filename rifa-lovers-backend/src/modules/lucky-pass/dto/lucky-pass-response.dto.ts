export class LuckyPassResponseDto {
  id: string
  ticketNumber: number
  status: string
  isWinner: boolean
  raffleId: string
  raffleName: string
  createdAt: string
}

export class LuckyPassSummaryDto {
  total: number
  active: number
  used: number
  winners: number
}
