import { Injectable, Logger, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleStatus, UserRole, PurchaseStatus } from '@prisma/client'
import { CreatePackDto, UpdatePackDto, CreateOrganizationDto } from './dto'
import type { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from '../admin/dto'
import { DrawService } from '../draw/draw.service'
import { NewsletterService } from '../newsletter/newsletter.service'
import { SendCampaignDto } from '../newsletter/dto'
import { SupabaseService } from '../../config/supabase.service'

interface UploadedFile {
  buffer: Buffer
  mimetype: string
  originalname: string
  size: number
}

export interface OperatorKpiData {
  totalSales: number
  packsSold: number
  activeRaffles: number
  totalPurchases: number
  pendingPurchases: number
  completedPurchases: number
  failedPurchases: number
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
  coverImageUrl: string | null
  packsSold: number
  progressPercentage: number
  totalRevenue: number
}

export interface PackWithStats {
  id: string
  name: string | null
  price: number
  luckyPassQuantity: number
  isFeatured: boolean
  isPreSale: boolean
  raffleId: string | null
  createdAt: Date
}

@Injectable()
export class OperatorService {
  private readonly logger = new Logger(OperatorService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly drawService: DrawService,
    private readonly newsletterService: NewsletterService,
    private readonly supabaseService: SupabaseService,
  ) {}

  private async assertOrganization(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, role: true },
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    if (user.role !== UserRole.operator && user.role !== UserRole.admin) {
      throw new ForbiddenException('Solo operadores pueden acceder a este recurso')
    }
    if (!user.organizationId) {
      throw new ForbiddenException('Debes completar tu perfil de empresa antes de continuar')
    }
    return user.organizationId
  }

  // ==================== ORGANIZATION ====================

  async createOrganization(userId: string, dto: CreateOrganizationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, organizationId: true },
    })
    if (!user) throw new NotFoundException('Usuario no encontrado')
    if (user.role !== UserRole.operator) {
      throw new ForbiddenException('Solo operadores pueden crear una organizacion')
    }
    if (user.organizationId) {
      throw new BadRequestException('Ya tienes una organizacion asignada')
    }

    const slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const org = await this.prisma.organization.create({
      data: { name: dto.name, slug },
    })

    await this.prisma.user.update({
      where: { id: userId },
      data: { organizationId: org.id },
    })

    this.logger.log(`Operador ${userId} creo organizacion ${org.id}`)
    return org
  }

  async getOrganization(userId: string) {
    const orgId = await this.assertOrganization(userId)
    const org = await this.prisma.organization.findUnique({
      where: { id: orgId },
    })
    if (!org) throw new NotFoundException('Organizacion no encontrada')
    return org
  }

  // ==================== KPIs ====================

  async getKpis(userId: string): Promise<OperatorKpiData> {
    const orgId = await this.assertOrganization(userId)

    const raffleIds = await this.prisma.raffle.findMany({
      where: { organizationId: orgId },
      select: { id: true },
    }).then(rs => rs.map(r => r.id))

    const [
      totalSales,
      packsSold,
      activeRaffles,
      totalPurchases,
      pendingPurchases,
      completedPurchases,
      failedPurchases,
      totalLuckyPasses,
      winnersCount,
    ] = await this.prisma.$transaction([
      this.prisma.purchase.aggregate({
        where: { raffleId: { in: raffleIds }, status: PurchaseStatus.paid },
        _sum: { totalAmount: true },
      }),
      this.prisma.raffleProgress.aggregate({
        where: { raffleId: { in: raffleIds } },
        _sum: { packsSold: true },
      }),
      this.prisma.raffle.count({
        where: { organizationId: orgId, status: RaffleStatus.active },
      }),
      this.prisma.purchase.count({ where: { raffleId: { in: raffleIds } } }),
      this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: PurchaseStatus.pending } }),
      this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: PurchaseStatus.paid } }),
      this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: PurchaseStatus.failed } }),
      this.prisma.luckyPass.count({ where: { raffleId: { in: raffleIds } } }),
      this.prisma.prizeWinner.count({ where: { luckyPass: { raffleId: { in: raffleIds } } } }),
    ])

    return {
      totalSales: Number(totalSales._sum.totalAmount ?? 0),
      packsSold: packsSold._sum.packsSold ?? 0,
      activeRaffles,
      totalPurchases,
      pendingPurchases,
      completedPurchases,
      failedPurchases,
      totalLuckyPasses,
      winnersCount,
    }
  }

  // ==================== RIFAS ====================

  async getRaffles(userId: string): Promise<RaffleWithStats[]> {
    const orgId = await this.assertOrganization(userId)

    const raffles = await this.prisma.raffle.findMany({
      where: { organizationId: orgId },
      include: { progress: true, packs: true },
      orderBy: { createdAt: 'desc' },
    })

    return raffles.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      goalPacks: r.goalPacks,
      status: r.status,
      startDate: r.startDate,
      endDate: r.endDate,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      coverImageUrl: r.coverImageUrl,
      packsSold: r.progress?.packsSold ?? 0,
      progressPercentage: Number(r.progress?.percentageToGoal ?? 0),
      totalRevenue: Number(r.progress?.revenueTotal ?? 0),
    }))
  }

  async createRaffle(userId: string, dto: CreateRaffleDto): Promise<RaffleWithStats> {
    const orgId = await this.assertOrganization(userId)
    this.logger.log(`Operador ${userId} creando rifa: ${dto.title}`)

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
          organizationId: orgId,
        },
      })

      for (let i = 0; i < prizes.length; i++) {
        const prizeDto = prizes[i]
        const requiredPacks = i === prizes.length - 1 ? goalPacks : segmentSize * (i + 1)
        await tx.prize.create({
          data: {
            name: prizeDto.name,
            description: prizeDto.description,
            raffleId: raffle.id,
            type: 'milestone',
            quantity: 1,
            valueEstimated: 0,
          },
        })
        await tx.milestone.create({
          data: {
            name: `Milestone ${i + 1}`,
            requiredPacks,
            raffleId: raffle.id,
            sortOrder: i + 1,
          },
        })
      }

      await tx.raffleProgress.create({
        data: {
          raffleId: raffle.id,
          packsSold: 0,
          revenueTotal: 0,
          percentageToGoal: 0,
        },
      })

      return raffle
    })

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
      coverImageUrl: result.coverImageUrl,
      packsSold: 0,
      progressPercentage: 0,
      totalRevenue: 0,
    }
  }

  async updateRaffle(userId: string, raffleId: string, dto: UpdateRaffleDto): Promise<RaffleWithStats> {
    await this.assertOrganization(userId)
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { progress: true },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    const updated = await this.prisma.raffle.update({
      where: { id: raffleId },
      data: {
        title: dto.title,
        description: dto.description,
        goalPacks: dto.goalPacks,
        maxTicketNumber: dto.maxTicketNumber,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: dto.status,
      },
      include: { progress: true },
    })

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      goalPacks: updated.goalPacks,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      coverImageUrl: updated.coverImageUrl,
      packsSold: updated.progress?.packsSold ?? 0,
      progressPercentage: Number(updated.progress?.percentageToGoal ?? 0),
      totalRevenue: Number(updated.progress?.revenueTotal ?? 0),
    }
  }

  async updateRaffleStatus(userId: string, raffleId: string, dto: UpdateRaffleStatusDto): Promise<RaffleWithStats> {
    await this.assertOrganization(userId)
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { progress: true },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    const updated = await this.prisma.raffle.update({
      where: { id: raffleId },
      data: { status: dto.status },
      include: { progress: true },
    })

    return {
      id: updated.id,
      title: updated.title,
      description: updated.description,
      goalPacks: updated.goalPacks,
      status: updated.status,
      startDate: updated.startDate,
      endDate: updated.endDate,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      coverImageUrl: updated.coverImageUrl,
      packsSold: updated.progress?.packsSold ?? 0,
      progressPercentage: Number(updated.progress?.percentageToGoal ?? 0),
      totalRevenue: Number(updated.progress?.revenueTotal ?? 0),
    }
  }

  async uploadCover(userId: string, raffleId: string, file: UploadedFile): Promise<{ coverImageUrl: string }> {
    const orgId = await this.assertOrganization(userId)

    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId, organizationId: orgId },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    // Delete previous cover if exists
    if (raffle.coverImageUrl) {
      try {
        const oldPath = raffle.coverImageUrl.split('/').pop()
        if (oldPath) {
          await this.supabaseService.deleteFile('raffle-covers', oldPath)
        }
      } catch {
        // ignore cleanup errors
      }
    }

    const ext = file.mimetype.split('/')[1] || 'jpg'
    const path = `${raffleId}-${Date.now()}.${ext}`
    const buffer = file.buffer
    const publicUrl = await this.supabaseService.uploadFile('raffle-covers', path, buffer, file.mimetype)

    await this.prisma.raffle.update({
      where: { id: raffleId },
      data: { coverImageUrl: publicUrl },
    })

    return { coverImageUrl: publicUrl }
  }

  // ==================== PACKS ====================

  async getPacks(userId: string, raffleId: string): Promise<PackWithStats[]> {
    const orgId = await this.assertOrganization(userId)
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId, organizationId: orgId },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    const packs = await this.prisma.pack.findMany({
      where: { raffleId },
      orderBy: { createdAt: 'desc' },
    })

    return packs.map(p => ({
      id: p.id,
      name: p.name,
      price: Number(p.price ?? 0),
      luckyPassQuantity: p.luckyPassQuantity,
      isFeatured: p.isFeatured,
      isPreSale: p.isPreSale,
      raffleId: p.raffleId,
      createdAt: p.createdAt,
    }))
  }

  async createPack(userId: string, raffleId: string, dto: CreatePackDto): Promise<PackWithStats> {
    const orgId = await this.assertOrganization(userId)
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId, organizationId: orgId },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    const pack = await this.prisma.pack.create({
      data: {
        name: dto.name,
        price: dto.price,
        luckyPassQuantity: dto.luckyPassQuantity,
        isFeatured: dto.isFeatured ?? false,
        isPreSale: dto.isPreSale ?? false,
        raffleId,
      },
    })

    return {
      id: pack.id,
      name: pack.name,
      price: Number(pack.price ?? 0),
      luckyPassQuantity: pack.luckyPassQuantity,
      isFeatured: pack.isFeatured,
      isPreSale: pack.isPreSale,
      raffleId: pack.raffleId,
      createdAt: pack.createdAt,
    }
  }

  async updatePack(userId: string, packId: string, dto: UpdatePackDto): Promise<PackWithStats> {
    await this.assertOrganization(userId)
    const existing = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { raffle: true },
    })
    if (!existing || !existing.raffle) throw new NotFoundException('Pack no encontrado')

    const updated = await this.prisma.pack.update({
      where: { id: packId },
      data: {
        name: dto.name,
        price: dto.price,
        luckyPassQuantity: dto.luckyPassQuantity,
        isFeatured: dto.isFeatured,
        isPreSale: dto.isPreSale,
      },
    })

    return {
      id: updated.id,
      name: updated.name,
      price: Number(updated.price ?? 0),
      luckyPassQuantity: updated.luckyPassQuantity,
      isFeatured: updated.isFeatured,
      isPreSale: updated.isPreSale,
      raffleId: updated.raffleId,
      createdAt: updated.createdAt,
    }
  }

  async deletePack(userId: string, packId: string): Promise<void> {
    await this.assertOrganization(userId)
    const existing = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { raffle: true },
    })
    if (!existing || !existing.raffle) throw new NotFoundException('Pack no encontrado')

    await this.prisma.pack.delete({ where: { id: packId } })
  }

  // ==================== PARTICIPANTS & DRAW ====================

  async getParticipants(userId: string, raffleId: string) {
    await this.assertOrganization(userId)
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
      include: { luckyPasses: { include: { user: true } } },
    })
    if (!raffle) throw new NotFoundException('Rifa no encontrada')

    const participants = raffle.luckyPasses.reduce((acc, lp) => {
      if (!lp.user) return acc
      const key = lp.user.id
      if (!acc[key]) {
        acc[key] = {
          id: lp.user.id,
          name: `${lp.user.firstName ?? ''} ${lp.user.lastName ?? ''}`.trim() || 'Usuario',
          email: lp.user.email ?? '',
          ticketCount: 0,
          tickets: [] as number[],
        }
      }
      acc[key].ticketCount++
      if (lp.ticketNumber) acc[key].tickets.push(lp.ticketNumber)
      return acc
    }, {} as Record<string, { id: string; name: string; email: string; ticketCount: number; tickets: number[] }>)

    return Object.values(participants)
  }

  async getDrawStatus(userId: string, raffleId: string) {
    await this.assertOrganization(userId)
    const canExecute = await this.drawService.canExecuteDraw(raffleId)
    const results = await this.drawService.getDrawResults(raffleId)
    return {
      canExecute,
      results: results && results.winners.length > 0 ? results : null,
    }
  }

  async executeDraw(userId: string, raffleId: string, prizeId?: string) {
    await this.assertOrganization(userId)
    return this.drawService.executeDraw(raffleId, userId, prizeId)
  }

  // ==================== NEWSLETTER ====================

  async getNewsletterCampaigns(userId: string) {
    await this.assertOrganization(userId)
    return this.prisma.newsletterCampaign.findMany({
      where: { sentBy: userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async sendNewsletter(userId: string, dto: SendCampaignDto) {
    await this.assertOrganization(userId)

    // Contar campañas del mes actual
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const campaignsThisMonth = await this.prisma.newsletterCampaign.count({
      where: {
        sentBy: userId,
        createdAt: { gte: startOfMonth },
      },
    })

    if (campaignsThisMonth >= 10) {
      throw new ForbiddenException('Has alcanzado el limite de 10 campanas mensuales. Contacta al administrador para mas informacion.')
    }

    const orgId = await this.assertOrganization(userId)
    const activeRaffle = await this.prisma.raffle.findFirst({
      where: { organizationId: orgId, status: RaffleStatus.active },
      select: { coverImageUrl: true },
    })

    const enrichedDto = { ...dto, coverImageUrl: activeRaffle?.coverImageUrl ?? undefined }
    const result = await this.newsletterService.sendCampaign(enrichedDto, userId)
    return {
      ...result,
      remaining: 9 - campaignsThisMonth,
    }
  }
}
