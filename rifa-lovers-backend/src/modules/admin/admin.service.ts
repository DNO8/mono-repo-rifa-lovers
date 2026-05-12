import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleStatus, UserStatus, Prisma } from '@prisma/client'
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto'

export interface KpiData {
  totalSales: number
  packsSold: number
  activeUsers: number
  activeRaffles: number
  totalPurchases: number
  pendingPurchases: number
  completedPurchases: number
  failedPurchases: number
  refundedPurchases: number
  totalLuckyPasses: number
  winnersCount: number
}

export interface RaffleWithStats {
  id: string
  title: string | null
  description: string | null
  goalPacks: number
  status: RaffleStatus
  startDate: Date | null
  endDate: Date | null
  createdAt: Date
  updatedAt: Date
  packsSold: number
  progressPercentage: number
  totalRevenue: number
}

export interface Participant {
  id: string
  name: string
  email: string
  ticketCount: number
  tickets: number[]
}

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ==================== GESTIÓN DE RIFAS ====================

  async createRaffle(adminId: string, dto: CreateRaffleDto): Promise<RaffleWithStats> {
    this.logger.log(`Admin ${adminId} creando rifa: ${dto.title}`)

    const prizes = dto.prizes ?? []
    const goalPacks = dto.goalPacks
    const segmentSize = Math.floor(goalPacks / prizes.length)

    const result = await this.prisma.$transaction(async (tx) => {
      const raffle = await tx.raffle.create({
        data: {
          title: dto.title,
          description: dto.description,
          goalPacks,
          maxTicketNumber: dto.maxTicketNumber ?? 30000,
          startDate: dto.startDate ? new Date(dto.startDate) : null,
          endDate: dto.endDate ? new Date(dto.endDate) : null,
          status: dto.status || RaffleStatus.draft,
        },
      })

      for (let i = 0; i < prizes.length; i++) {
        const prizeDto = prizes[i]
        const requiredPacks = i === prizes.length - 1 ? goalPacks : segmentSize * (i + 1)

        const milestone = await tx.milestone.create({
          data: {
            raffleId: raffle.id,
            name: `Meta ${i + 1}`,
            requiredPacks,
            sortOrder: i + 1,
          },
        })

        await tx.prize.create({
          data: {
            raffleId: raffle.id,
            milestoneId: milestone.id,
            type: 'milestone',
            name: prizeDto.name,
            description: prizeDto.description ?? null,
            quantity: 1,
          },
        })
      }

      return raffle
    })

    this.logger.log(`Rifa creada: ${result.id} con ${prizes.length} premio(s)`)
    return {
      id: result.id,
      title: result.title,
      description: result.description,
      goalPacks: result.goalPacks,
      status: result.status,
      startDate: result.startDate,
      endDate: result.endDate,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      packsSold: 0,
      progressPercentage: 0,
      totalRevenue: 0,
    }
  }

  async updateRaffle(raffleId: string, dto: UpdateRaffleDto) {
    this.logger.log(`Actualizando rifa: ${raffleId}`)

    const existing = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!existing) {
      throw new NotFoundException('Rifa no encontrada')
    }

    const updateData: Prisma.RaffleUpdateInput = {}
    if (dto.title !== undefined) updateData.title = dto.title
    if (dto.description !== undefined) updateData.description = dto.description
    if (dto.goalPacks !== undefined) updateData.goalPacks = dto.goalPacks
    if (dto.startDate !== undefined) updateData.startDate = dto.startDate ? new Date(dto.startDate) : null
    if (dto.endDate !== undefined) updateData.endDate = dto.endDate ? new Date(dto.endDate) : null
    if (dto.status !== undefined) updateData.status = dto.status

    const raffle = await this.prisma.raffle.update({
      where: { id: raffleId },
      data: updateData,
    })

    this.logger.log(`Rifa actualizada: ${raffle.id}`)
    return raffle
  }

  async updateRaffleStatus(raffleId: string, dto: UpdateRaffleStatusDto) {
    this.logger.log(`Cambiando estado de rifa ${raffleId} a: ${dto.status}`)

    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    // Validaciones de transición de estado
    const validTransitions: Record<RaffleStatus, RaffleStatus[]> = {
      [RaffleStatus.draft]: [RaffleStatus.active],
      [RaffleStatus.active]: [RaffleStatus.sold_out, RaffleStatus.closed],
      [RaffleStatus.sold_out]: [RaffleStatus.closed],
      [RaffleStatus.closed]: [RaffleStatus.drawn, RaffleStatus.active],
      [RaffleStatus.drawn]: [],
    }

    if (!validTransitions[raffle.status].includes(dto.status)) {
      throw new BadRequestException(
        `No se puede cambiar de ${raffle.status} a ${dto.status}. Transiciones válidas: ${validTransitions[raffle.status].join(', ')}`
      )
    }

    const updated = await this.prisma.raffle.update({
      where: { id: raffleId },
      data: { status: dto.status },
    })

    this.logger.log(`Estado actualizado: ${raffle.status} → ${dto.status}`)
    return updated
  }

  async getRaffleDetail(raffleId: string) {
    this.logger.log(`Obteniendo detalle de rifa: ${raffleId}`)

    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: {
        _count: {
          select: {
            luckyPasses: true,
            purchases: true,
          },
        },
      },
    })

    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    return {
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      maxTicketNumber: raffle.maxTicketNumber,
      status: raffle.status,
      createdAt: raffle.createdAt.toISOString(),
      endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
      totalPasses: raffle._count.luckyPasses,
      totalPurchases: raffle._count.purchases,
    }
  }

  async getRaffleParticipants(raffleId: string) {
    this.logger.log(`Obteniendo participantes de rifa: ${raffleId}`)

    // Verificar que la rifa existe
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    // Obtener todos los lucky passes (participantes únicos)
    const luckyPasses = await this.prisma.luckyPass.findMany({
      where: { raffleId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    // Agrupar por usuario
    const participantsMap = new Map<string, Participant>()
    
    for (const pass of luckyPasses) {
      if (!pass.user) continue
      
      const userId = pass.user.id
      if (!participantsMap.has(userId)) {
        const fullName = `${pass.user.firstName ?? ''} ${pass.user.lastName ?? ''}`.trim()
        participantsMap.set(userId, {
          id: userId,
          name: fullName || (pass.user.email ?? ''),
          email: pass.user.email ?? '',
          ticketCount: 0,
          tickets: [],
        })
      }
      
      const participant = participantsMap.get(userId)!
      participant.ticketCount++
      if (pass.ticketNumber !== null) {
        participant.tickets.push(pass.ticketNumber)
      }
    }

    return Array.from(participantsMap.values())
  }

  async getAllRaffles(): Promise<RaffleWithStats[]> {
    const raffles = await this.prisma.raffle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { luckyPasses: true },
        },
        purchases: {
          where: { status: 'paid' },
          select: { totalAmount: true, userPacks: { select: { quantity: true } } },
        },
      },
    })

    return raffles.map((raffle) => {
      const packsSold = raffle.purchases.reduce((sum, p) => {
        return sum + p.userPacks.reduce((s, up) => s + up.quantity, 0)
      }, 0)
      const progressPercentage = raffle.goalPacks > 0 
        ? Math.min(100, Math.round((packsSold / raffle.goalPacks) * 100))
        : 0
      
      const totalRevenue = raffle.purchases.reduce((sum, p) => {
        const amount = p.totalAmount ? Number(p.totalAmount) : 0
        return sum + amount
      }, 0)

      return {
        id: raffle.id,
        title: raffle.title,
        description: raffle.description,
        goalPacks: raffle.goalPacks,
        status: raffle.status,
        startDate: raffle.startDate,
        endDate: raffle.endDate,
        createdAt: raffle.createdAt,
        updatedAt: raffle.updatedAt,
        packsSold,
        progressPercentage,
        totalRevenue,
      }
    })
  }

  // ==================== KPIs ====================

  async getKpis(): Promise<KpiData> {
    this.logger.log('Obteniendo KPIs')

    const [
      totalSalesAgg,
      packsSold,
      activeUsers,
      activeRaffles,
      totalPurchases,
      pendingPurchases,
      completedPurchases,
      failedPurchases,
      refundedPurchases,
      totalLuckyPasses,
      winnersCount,
    ] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: { status: 'paid' },
        _sum: { totalAmount: true },
      }),

      this.prisma.userPack.count({
        where: { purchase: { status: 'paid' } },
      }),

      this.prisma.user.count({
        where: { status: UserStatus.active },
      }),

      this.prisma.raffle.count({
        where: { status: RaffleStatus.active },
      }),

      this.prisma.purchase.count(),

      this.prisma.purchase.count({
        where: { status: 'pending' },
      }),

      this.prisma.purchase.count({
        where: { status: 'paid' },
      }),

      this.prisma.purchase.count({
        where: { status: 'failed' },
      }),

      this.prisma.purchase.count({
        where: { status: 'refunded' },
      }),

      this.prisma.luckyPass.count(),

      this.prisma.prizeWinner.count(),
    ])

    const totalSales = totalSalesAgg._sum.totalAmount 
      ? Number(totalSalesAgg._sum.totalAmount) 
      : 0

    return {
      totalSales,
      packsSold,
      activeUsers,
      activeRaffles,
      totalPurchases,
      pendingPurchases,
      completedPurchases,
      failedPurchases,
      refundedPurchases,
      totalLuckyPasses,
      winnersCount,
    }
  }

  // ==================== GESTIÓN DE USUARIOS ====================

  async updateUserRole(userId: string, dto: UpdateUserRoleDto) {
    this.logger.log(`Cambiando rol de usuario ${userId} a: ${dto.role}`)

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { role: dto.role },
    })

    this.logger.log(`Rol actualizado: ${user.role} → ${dto.role}`)
    return updated
  }

  async updateUserStatus(userId: string, dto: UpdateUserStatusDto) {
    this.logger.log(`Cambiando estado de usuario ${userId} a: ${dto.status}`)

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('Usuario no encontrado')
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { status: dto.status },
    })

    this.logger.log(`Estado actualizado: ${user.status} → ${dto.status}`)
    return updated
  }

  async getAllUsers(skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true,
          _count: {
            select: { purchases: true, luckyPasses: true },
          },
        },
      }),
      this.prisma.user.count(),
    ])

    return { users, total, skip, take }
  }
}
