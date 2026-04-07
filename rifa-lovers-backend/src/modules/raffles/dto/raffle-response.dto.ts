export class RaffleResponseDto {
  id: string
  title: string | null
  description: string | null
  goalPacks: number
  status: string
  createdAt: string
}

export class RaffleProgressDto {
  raffleId: string
  packsSold: number
  revenueTotal: number
  percentageToGoal: number
}
