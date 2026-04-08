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
}
