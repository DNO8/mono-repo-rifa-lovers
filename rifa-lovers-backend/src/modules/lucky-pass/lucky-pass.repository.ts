import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { Prisma, LuckyPass, LuckyPassStatus } from '@prisma/client'

@Injectable()
export class LuckyPassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.LuckyPassWhereUniqueInput,
    include?: Prisma.LuckyPassInclude,
  ): Promise<LuckyPass | null> {
    return this.prisma.luckyPass.findUnique({ where, include })
  }

  async findFirst(
    where: Prisma.LuckyPassWhereInput,
    include?: Prisma.LuckyPassInclude,
    orderBy?: Prisma.LuckyPassOrderByWithRelationInput,
  ): Promise<LuckyPass | null> {
    return this.prisma.luckyPass.findFirst({ where, include, orderBy })
  }

  async findMany(
    where?: Prisma.LuckyPassWhereInput,
    include?: Prisma.LuckyPassInclude,
    orderBy?: Prisma.LuckyPassOrderByWithRelationInput,
    skip?: number,
    take?: number,
  ): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({ where, include, orderBy, skip, take })
  }

  async create(data: Prisma.LuckyPassCreateInput): Promise<LuckyPass> {
    return this.prisma.luckyPass.create({ data })
  }

  async update(
    where: Prisma.LuckyPassWhereUniqueInput,
    data: Prisma.LuckyPassUpdateInput,
  ): Promise<LuckyPass> {
    return this.prisma.luckyPass.update({ where, data })
  }

  async delete(where: Prisma.LuckyPassWhereUniqueInput): Promise<LuckyPass> {
    return this.prisma.luckyPass.delete({ where })
  }

  async count(where?: Prisma.LuckyPassWhereInput): Promise<number> {
    return this.prisma.luckyPass.count({ where })
  }

  async findByUser(userId: string, include?: Prisma.LuckyPassInclude): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByRaffle(raffleId: string, include?: Prisma.LuckyPassInclude): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({
      where: { raffleId },
      include,
      orderBy: { ticketNumber: 'asc' },
    })
  }

  async findByUserPack(userPackId: string): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({
      where: { userPackId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(
    id: string,
    status: LuckyPassStatus,
  ): Promise<LuckyPass> {
    return this.prisma.luckyPass.update({
      where: { id },
      data: { status },
    })
  }

  async markAsWinner(id: string): Promise<LuckyPass> {
    return this.prisma.luckyPass.update({
      where: { id },
      data: { isWinner: true, status: 'winner' },
    })
  }

  async findActiveByUser(userId: string): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({
      where: { userId, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findWinnersByRaffle(raffleId: string): Promise<LuckyPass[]> {
    return this.prisma.luckyPass.findMany({
      where: { raffleId, isWinner: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByTicketNumber(
    raffleId: string,
    ticketNumber: number,
  ): Promise<LuckyPass | null> {
    return this.prisma.luckyPass.findFirst({
      where: { raffleId, ticketNumber },
    })
  }

  async countByUserAndStatus(userId: string, status?: LuckyPassStatus): Promise<number> {
    const where: Prisma.LuckyPassWhereInput = { userId }
    if (status) {
      where.status = status
    }
    return this.prisma.luckyPass.count({ where })
  }

  async countWinnersByUser(userId: string): Promise<number> {
    return this.prisma.luckyPass.count({
      where: { userId, isWinner: true },
    })
  }

  async createMany(data: Prisma.LuckyPassCreateManyInput[]): Promise<Prisma.BatchPayload> {
    return this.prisma.luckyPass.createMany({
      data,
      skipDuplicates: true,
    })
  }
}
