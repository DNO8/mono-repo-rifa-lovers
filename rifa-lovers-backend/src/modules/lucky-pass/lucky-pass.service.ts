import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { LuckyPassRepository } from './lucky-pass.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { PrismaService } from '../../database/prisma.service'
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
    private readonly prisma: PrismaService,
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
      totalPasses: total,
      activePasses: active,
      usedPasses: used,
      winnerPasses: winners,
      byRaffle: [],
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
    excludePurchaseId?: string,
  ): Promise<{ available: boolean }> {
    const raffle = await this.rafflesRepository.findUnique({ id: raffleId })
    if (!raffle) return { available: false }
    if (ticketNumber < 1 || ticketNumber > raffle.maxTicketNumber) return { available: false }

    const existingPass = await this.luckyPassRepository.findByTicketNumber(raffleId, ticketNumber)
    if (existingPass) return { available: false }

    let reservationRows: { count: string }[]
    if (excludePurchaseId) {
      reservationRows = await this.prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
          AND purchase_id != ${excludePurchaseId}::uuid
      `
    } else {
      reservationRows = await this.prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM public.ticket_reservations
        WHERE raffle_id = ${raffleId}::uuid
          AND ticket_number = ${ticketNumber}
          AND expires_at > NOW()
      `
    }

    const isReserved = parseInt(reservationRows[0]?.count ?? '0', 10) > 0
    return { available: !isReserved }
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
