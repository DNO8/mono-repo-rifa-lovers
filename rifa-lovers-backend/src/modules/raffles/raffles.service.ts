import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleResponseDto, RaffleProgressDto } from './dto'

@Injectable()
export class RafflesService {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(): Promise<RaffleResponseDto | null> {
    const raffle = await this.prisma.raffle.findFirst({
      where: { status: 'active' },
      include: {
        progress: true,
      },
    })

    if (!raffle) return null

    return {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      status: raffle.status,
      createdAt: raffle.createdAt.toISOString(),
    }
  }

  async getActiveProgress(): Promise<RaffleProgressDto | null> {
    const raffle = await this.prisma.raffle.findFirst({
      where: { status: 'active' },
      include: {
        progress: true,
      },
    })

    if (!raffle || !raffle.progress) return null

    const progress = raffle.progress

    return {
      raffleId: raffle.id,
      packsSold: progress.packsSold,
      revenueTotal: progress.revenueTotal ? progress.revenueTotal.toNumber() : 0,
      percentageToGoal: progress.percentageToGoal ? progress.percentageToGoal.toNumber() : 0,
    }
  }
}
