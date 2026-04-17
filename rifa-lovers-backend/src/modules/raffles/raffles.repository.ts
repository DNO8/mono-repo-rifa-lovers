import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { Prisma, Raffle, RaffleStatus } from '@prisma/client'

@Injectable()
export class RafflesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.RaffleWhereUniqueInput,
    include?: Prisma.RaffleInclude,
  ): Promise<Raffle | null> {
    return this.prisma.raffle.findUnique({ where, include })
  }

  async findFirst(
    where: Prisma.RaffleWhereInput,
    include?: Prisma.RaffleInclude,
    orderBy?: Prisma.RaffleOrderByWithRelationInput,
  ): Promise<Raffle | null> {
    return this.prisma.raffle.findFirst({ where, include, orderBy })
  }

  async findMany(
    where?: Prisma.RaffleWhereInput,
    include?: Prisma.RaffleInclude,
    orderBy?: Prisma.RaffleOrderByWithRelationInput,
    skip?: number,
    take?: number,
  ): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({ where, include, orderBy, skip, take })
  }

  async create(data: Prisma.RaffleCreateInput): Promise<Raffle> {
    return this.prisma.raffle.create({ data })
  }

  async update(
    where: Prisma.RaffleWhereUniqueInput,
    data: Prisma.RaffleUpdateInput,
  ): Promise<Raffle> {
    return this.prisma.raffle.update({ where, data })
  }

  async delete(where: Prisma.RaffleWhereUniqueInput): Promise<Raffle> {
    return this.prisma.raffle.delete({ where })
  }

  async count(where?: Prisma.RaffleWhereInput): Promise<number> {
    return this.prisma.raffle.count({ where })
  }

  async findActiveWithProgress(): Promise<Raffle | null> {
    return this.prisma.raffle.findFirst({
      where: { status: 'active' },
      include: {
        progress: true,
        milestones: {
          include: {
            prizes: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            luckyPasses: true,
          },
        },
      },
    })
  }

  async findByStatus(status: RaffleStatus): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({
      where: { status },
      include: {
        progress: true,
        _count: {
          select: {
            purchases: true,
            luckyPasses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(
    id: string,
    status: RaffleStatus,
  ): Promise<Raffle> {
    return this.prisma.raffle.update({
      where: { id },
      data: { status },
    })
  }

  async findWithPrizes(id: string): Promise<Raffle | null> {
    return this.prisma.raffle.findUnique({
      where: { id },
      include: {
        prizes: {
          include: {
            milestone: true,
          },
        },
        milestones: {
          include: {
            prizes: true,
          },
        },
      },
    })
  }

  async findUserRaffles(): Promise<Raffle[]> {
    return this.prisma.raffle.findMany({
      where: {
        OR: [
          { status: 'active' },
          { status: 'drawn' },
        ],
        purchases: {
          some: {}, // User has at least one purchase in these raffles
        },
      },
      include: {
        progress: true,
        milestones: {
          include: {
            prizes: true,
          },
        },
        _count: {
          select: {
            purchases: true,
            luckyPasses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findActiveExpiredRaffles(): Promise<Array<{
    id: string
    title: string | null
    status: string
    endDate: Date | null
  }>> {
    return this.prisma.raffle.findMany({
      where: {
        status: 'active',
        endDate: {
          lte: new Date(), // endDate <= now
        },
      },
      select: {
        id: true,
        title: true,
        endDate: true,
        status: true,
      },
    })
  }

  /**
   * Obtiene participantes únicos de una rifa (agrupados por usuario)
   */
  async getUniqueParticipants(raffleId: string): Promise<Array<{
    userId: string
    email: string | null
    firstName: string | null
    lastName: string | null
    luckyPassIds: string[]
  }>> {
    const participants = await this.prisma.luckyPass.groupBy({
      by: ['userId'],
      where: {
        raffleId,
        status: 'active',
      },
      _count: {
        id: true,
      },
    })

    // Obtener detalles de usuarios y LuckyPasses
    const result = await Promise.all(
      participants.map(async (participant) => {
        const user = await this.prisma.user.findUnique({
          where: { id: participant.userId || '' },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        })

        const luckyPasses = await this.prisma.luckyPass.findMany({
          where: {
            raffleId,
            userId: participant.userId || '',
            status: 'active',
          },
          select: { id: true },
        })

        return {
          userId: participant.userId || '',
          email: user?.email || null,
          firstName: user?.firstName || null,
          lastName: user?.lastName || null,
          luckyPassIds: luckyPasses.map(lp => lp.id),
        }
      }),
    )

    return result
  }

  /**
   * Obtiene detalles de un usuario
   */
  async getUserById(userId: string): Promise<{
    id: string
    email: string | null
    firstName: string | null
    lastName: string | null
    organizationId: string | null
    role: string
  } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        organizationId: true,
        role: true,
      },
    })
  }
}
