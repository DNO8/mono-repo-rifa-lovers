import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto'

@Injectable()
export class LuckyPassService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<LuckyPassResponseDto[]> {
    const passes = await this.prisma.luckyPass.findMany({
      where: { userId: userId },
      include: {
        raffle: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return passes.map((pass) => ({
      id: pass.id,
      ticketNumber: pass.ticketNumber || 0,
      status: pass.status,
      isWinner: pass.isWinner,
      raffleId: pass.raffleId || '',
      raffleName: pass.raffle?.title || 'Rifa sin nombre',
      createdAt: pass.createdAt.toISOString(),
    }))
  }

  async getSummary(userId: string): Promise<LuckyPassSummaryDto> {
    const [
      total,
      active,
      used,
      winners,
    ] = await Promise.all([
      this.prisma.luckyPass.count({ where: { userId: userId } }),
      this.prisma.luckyPass.count({ where: { userId: userId, status: 'active' } }),
      this.prisma.luckyPass.count({ where: { userId: userId, status: 'used' } }),
      this.prisma.luckyPass.count({ where: { userId: userId, isWinner: true } }),
    ])

    return {
      total,
      active,
      used,
      winners,
    }
  }
}
