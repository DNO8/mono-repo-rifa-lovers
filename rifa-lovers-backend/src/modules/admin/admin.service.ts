import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleStatus, UserRole, UserStatus, Prisma } from '@prisma/client'
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto'

export interface KpiData {
  totalSales: number
  packsSold: number
  activeUsers: number
  activeRaffles: number
  totalPurchases: number
  pendingPurchases: number
  completedPurchases: number
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

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ==================== GESTIÓN DE RIFAS ====================

  async createRaffle(adminId: string, dto: CreateRaffleDto) {
    this.logger.log(`Admin ${adminId} creando rifa: ${dto.title}`)

    const raffle = await this.prisma.raffle.create({
      data: {
        title: dto.title,
        description: dto.description,
        goalPacks: dto.goalPacks,
        startDate: dto.startDate ? new Date(dto.startDate) : null,
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        status: dto.status || RaffleStatus.draft,
      },
    })

    this.logger.log(`Rifa creada: ${raffle.id}`)
    return raffle
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
      [RaffleStatus.closed]: [RaffleStatus.drawn],
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

  async getAllRaffles(): Promise<RaffleWithStats[]> {
    const raffles = await this.prisma.raffle.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { userPacks: true, luckyPasses: true },
        },
        purchases: {
          where: { status: 'paid' },
          select: { totalAmount: true },
        },
      },
    })

    return raffles.map((raffle) => {
      const packsSold = raffle._count.userPacks
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
      totalLuckyPasses,
      winnersCount,
    ] = await Promise.all([
      this.prisma.purchase.aggregate({
        where: { status: 'paid' },
        _sum: { totalAmount: true },
      }),

      this.prisma.userPack.count(),

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
