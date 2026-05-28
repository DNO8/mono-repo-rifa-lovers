import { Injectable , NotFoundException } from '@nestjs/common'
import { RafflesRepository } from './raffles.repository'
import { PacksRepository } from '../packs/packs.repository'
import { mapPackToDto } from '../packs/mappers/pack.mapper'
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

  constructor(
    private readonly rafflesRepository: RafflesRepository,
    private readonly packsRepository: PacksRepository,
  ) {}

  async findActive(): Promise<RaffleResponseDto | null> {

    const raffle = await this.rafflesRepository.findActiveWithProgress() as RaffleWithProgressAndMilestones | null

    if (!raffle) {
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


    return {
      id: raffleEntity.id,
      title: raffleEntity.title,
      description: raffleEntity.description,
      goalPacks: raffleEntity.goalPacks,
      maxTicketNumber: raffleEntity.maxTicketNumber,
      status: raffleEntity.status,
      createdAt: raffleEntity.createdAt.toISOString(),
      endDate: raffleEntity.endDate ? raffleEntity.endDate.toISOString() : null,
      coverImageUrl: raffle.coverImageUrl,
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

    const raffle = await this.rafflesRepository.findActiveWithProgress() as RaffleWithProgressAndMilestones | null

    if (!raffle) {
      return {
        raffleId: '',
        packsSold: 0,
        revenueTotal: 0,
        percentageToGoal: 0,
      }
    }

    const progress = raffle.progress


    const packsSold = progress?.packsSold ?? 0
    const percentageToGoal = raffle.goalPacks > 0 ? Math.min((packsSold / raffle.goalPacks) * 100, 100) : 0

    return {
      raffleId: raffle.id,
      packsSold,
      revenueTotal: progress?.revenueTotal?.toNumber() ?? 0,
      percentageToGoal,
    }
  }

  async getPacksByRaffle(raffleId: string) {
    const packs = await this.packsRepository.findMany(
      { raffleId },
      { price: 'asc' },
    )
    return packs.map(mapPackToDto)
  }

  async getProgressByRaffle(raffleId: string): Promise<RaffleProgressDto> {

    const raffle = await this.rafflesRepository.findUnique(
      { id: raffleId },
      { progress: true },
    ) as RaffleWithProgressAndMilestones | null

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffleId} no encontrada`)
    }

    const progress = raffle.progress
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
      coverImageUrl: raffle.coverImageUrl,
    }
  }

  async findByStatus(status: RaffleStatus): Promise<RaffleResponseDto[]> {

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
      coverImageUrl: raffle.coverImageUrl,
    }))
  }

  async getPublicRaffles(): Promise<RaffleResponseDto[]> {

    const raffles = await this.rafflesRepository.findPublicRaffles()

    return raffles.map((raffle: Raffle & { progress: RaffleProgress | null; milestones: (Milestone & { prizes: Prize[] })[] }) => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      maxTicketNumber: raffle.maxTicketNumber,
      status: raffle.status,
      createdAt: raffle.createdAt.toISOString(),
      endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
      coverImageUrl: raffle.coverImageUrl,
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
    }))
  }

  async getUserRaffles(userId: string): Promise<RaffleResponseDto[]> {
    const raffles = await this.rafflesRepository.findUserRaffles(userId)

    return raffles.map((raffle: Raffle) => ({
      id: raffle.id,
      title: raffle.title,
      description: raffle.description,
      goalPacks: raffle.goalPacks,
      maxTicketNumber: raffle.maxTicketNumber,
      status: raffle.status,
      createdAt: raffle.createdAt.toISOString(),
      endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
      coverImageUrl: raffle.coverImageUrl,
    }))
  }
}
