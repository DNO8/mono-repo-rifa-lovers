import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LuckyPassRepository } from './lucky-pass.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto'
import { LuckyPass, Raffle } from '@prisma/client'
import { mapLuckyPassToDto } from './mappers/lucky-pass.mapper'

// Tipo que incluye la relación raffle
type LuckyPassWithRaffle = LuckyPass & { raffle: Raffle | null }

@Injectable()
export class LuckyPassService {
  private readonly logger = new Logger(LuckyPassService.name)

  constructor(
    private readonly luckyPassRepository: LuckyPassRepository,
    private readonly rafflesRepository: RafflesRepository,
  ) {}

  async findByUser(userId: string): Promise<LuckyPassResponseDto[]> {
    this.logger.debug(`Buscando lucky passes del usuario: ${userId}`)

    const passes = await this.luckyPassRepository.findByUser(userId, {
      raffle: true,
    })

    this.logger.debug(`Encontrados ${passes.length} lucky passes para el usuario ${userId}`)

    return passes.map((pass) => mapLuckyPassToDto(pass as LuckyPassWithRaffle))
  }

  async getSummary(userId: string): Promise<LuckyPassSummaryDto> {
    this.logger.debug(`Obteniendo resumen de lucky passes para usuario: ${userId}`)

    const [
      total,
      active,
      used,
      winners,
    ] = await Promise.all([
      this.luckyPassRepository.countByUserAndStatus(userId),
      this.luckyPassRepository.countByUserAndStatus(userId, 'active'),
      this.luckyPassRepository.countByUserAndStatus(userId, 'used'),
      this.luckyPassRepository.countWinnersByUser(userId),
    ])

    this.logger.debug(`Resumen lucky passes usuario ${userId}: total=${total}, activos=${active}, ganadores=${winners}`)

    return {
      total,
      active,
      used,
      winners,
    }
  }

  async findById(id: string): Promise<LuckyPassResponseDto> {
    this.logger.debug(`Buscando lucky pass por ID: ${id}`)

    const pass = await this.luckyPassRepository.findUnique(
      { id },
      { raffle: true },
    )

    if (!pass) {
      this.logger.warn(`Lucky pass no encontrado: ${id}`)
      throw new NotFoundException(`Lucky pass con ID ${id} no encontrado`)
    }

    return mapLuckyPassToDto(pass as LuckyPassWithRaffle)
  }

  async findByRaffle(raffleId: string): Promise<LuckyPassResponseDto[]> {
    this.logger.debug(`Buscando lucky passes de rifa: ${raffleId}`)

    const passes = await this.luckyPassRepository.findByRaffle(raffleId, {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    })

    return passes.map((pass) => mapLuckyPassToDto(pass as LuckyPassWithRaffle))
  }

  async checkAvailability(
    raffleId: string,
    ticketNumber: number,
  ): Promise<{ available: boolean }> {
    const raffle = await this.rafflesRepository.findUnique({ id: raffleId })
    if (!raffle) return { available: false }
    if (ticketNumber < 1 || ticketNumber > raffle.maxTicketNumber) return { available: false }
    const existing = await this.luckyPassRepository.findByTicketNumber(raffleId, ticketNumber)
    return { available: existing === null }
  }

  async markAsWinner(id: string): Promise<LuckyPassResponseDto> {
    this.logger.debug(`Marcando lucky pass ${id} como ganador`)

    const pass = await this.luckyPassRepository.markAsWinner(id)

    this.logger.log(`Lucky pass ${id} marcado como ganador`)

    // Obtener el pass actualizado con relaciones
    const passWithRaffle = await this.luckyPassRepository.findUnique(
      { id: pass.id },
      { raffle: true },
    )

    if (!passWithRaffle) {
      throw new NotFoundException('Error al recuperar el lucky pass actualizado')
    }

    return mapLuckyPassToDto(passWithRaffle as LuckyPassWithRaffle)
  }
}
