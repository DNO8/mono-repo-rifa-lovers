import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { RafflesRepository } from './raffles.repository'
import { RaffleResponseDto, RaffleProgressDto } from './dto'
import { RaffleEntity } from './entities'
import { Raffle, RaffleProgress, Milestone, Prize, RaffleStatus } from '@prisma/client'

// Tipo que incluye las relaciones progress y milestones
type RaffleWithProgressAndMilestones = Raffle & { 
  progress: RaffleProgress | null
  milestones: (Milestone & { prizes: Prize[] })[]
}

@Injectable()
export class RafflesService {
  private readonly logger = new Logger(RafflesService.name)

  constructor(private readonly rafflesRepository: RafflesRepository) {}

  async findActive(): Promise<RaffleResponseDto | null> {
    this.logger.debug('Buscando rifa activa')

    const raffle = await this.rafflesRepository.findActiveWithProgress() as RaffleWithProgressAndMilestones | null

    if (!raffle) {
      this.logger.debug('No se encontró rifa activa')
      return null
    }

    // Usar entidad de dominio para validaciones
    const raffleEntity = new RaffleEntity({
      id: raffle.id,
      organizationId: raffle.organizationId,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      maxTicketNumber: raffle.maxTicketNumber,
      status: raffle.status,
      startDate: raffle.startDate,
      endDate: raffle.endDate,
      createdAt: raffle.createdAt,
      updatedAt: raffle.updatedAt,
    })

    this.logger.debug(`Rifa activa encontrada: ${raffleEntity.id}`)

    return {
      id: raffleEntity.id,
      title: raffleEntity.title,
      description: raffleEntity.description,
      goalPacks: raffleEntity.goalPacks,
      maxTicketNumber: raffleEntity.maxTicketNumber,
      status: raffleEntity.status,
      createdAt: raffleEntity.createdAt.toISOString(),
      endDate: raffleEntity.endDate ? raffleEntity.endDate.toISOString() : null,
      milestones: raffle.milestones?.map(m => ({
        id: m.id,
        name: m.name,
        requiredPacks: m.requiredPacks,
        sortOrder: m.sortOrder,
        isUnlocked: (raffle.progress?.packsSold ?? 0) >= m.requiredPacks,
        prizes: m.prizes?.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          type: p.type,
        })) || [],
      })) || [],
    }
  }

  async getActiveProgress(): Promise<RaffleProgressDto> {
    this.logger.debug('Obteniendo progreso de rifa activa')

    const raffle = await this.rafflesRepository.findActiveWithProgress() as RaffleWithProgressAndMilestones | null

    if (!raffle) {
      this.logger.debug('No hay rifa activa, retornando progreso vacío')
      return {
        raffleId: '',
        packsSold: 0,
        revenueTotal: 0,
        percentageToGoal: 0,
      }
    }

    const progress = raffle.progress

    this.logger.debug(
      `Progreso rifa ${raffle.id}: ${progress?.packsSold ?? 0} packs vendidos`,
    )

    const packsSold = progress?.packsSold ?? 0
    const percentageToGoal = raffle.goalPacks > 0 ? Math.min((packsSold / raffle.goalPacks) * 100, 100) : 0

    return {
      raffleId: raffle.id,
      packsSold,
      revenueTotal: progress?.revenueTotal?.toNumber() ?? 0,
      percentageToGoal,
    }
  }

  async findById(id: string): Promise<RaffleResponseDto> {
    this.logger.debug(`Buscando rifa por ID: ${id}`)

    const raffle = await this.rafflesRepository.findUnique(
      { id },
      {
        progress: true,
        _count: {
          select: {
            purchases: true,
            luckyPasses: true,
          },
        },
      },
    )

    if (!raffle) {
      this.logger.warn(`Rifa no encontrada: ${id}`)
      throw new NotFoundException(`Rifa con ID ${id} no encontrada`)
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
    }
  }

  async findByStatus(status: RaffleStatus): Promise<RaffleResponseDto[]> {
    this.logger.debug(`Buscando rifas con estado: ${status}`)

    const raffles = await this.rafflesRepository.findByStatus(status)

    return raffles.map((raffle) => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      maxTicketNumber: raffle.maxTicketNumber,
      status: raffle.status,
      createdAt: raffle.createdAt.toISOString(),
      endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
    }))
  }
}
