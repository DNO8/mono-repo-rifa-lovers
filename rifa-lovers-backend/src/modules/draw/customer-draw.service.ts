import { Injectable, Logger, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common'
import { DrawService } from './draw.service'
import { RafflesRepository } from '../raffles/raffles.repository'
import { DrawWinner, DrawDiscarded, UserDetails, RaffleWithOrg } from './interfaces/draw-result.interface'

export interface CustomerDrawParticipant {
  userId: string
  email: string | null
  firstName: string | null
  lastName: string | null
  luckyPassIds: string[]
}

export interface CustomerDrawAvailability {
  canDraw: boolean
  reason?: string
  participants: CustomerDrawParticipant[]
  prizesCount: number
  activePassesCount: number
}

export interface CustomerDrawResult {
  winners: Array<{
    userId: string
    email: string | null
    firstName: string | null
    lastName: string | null
    prizeId: string
    prizeName: string
    luckyPassId: string
  }>
  discarded: Array<{
    userId: string
    email: string | null
    firstName: string | null
    lastName: string | null
    luckyPassId: string
  }>
}

@Injectable()
export class CustomerDrawService {
  private readonly logger = new Logger(CustomerDrawService.name)

  constructor(
    private readonly drawService: DrawService,
    private readonly rafflesRepository: RafflesRepository,
  ) {}

  /**
   * Verifica si un customer puede realizar el sorteo de su rifa
   */
  async checkCustomerDrawAvailability(
    raffleId: string,
    customerUserId: string,
  ): Promise<CustomerDrawAvailability> {
    this.logger.debug(`Customer ${customerUserId} verificando disponibilidad de sorteo para rifa ${raffleId}`)

    // 1. Validar que la rifa existe
    const raffle = await this.rafflesRepository.findUnique({ id: raffleId })
    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    // 2. Validar que el customer es dueño de la rifa (misma organización)
    await this.validateCustomerOwnership(raffleId, customerUserId)

    // 3. Validar que la rifa está cerrada
    if (raffle.status !== 'closed') {
      return {
        canDraw: false,
        reason: `La rifa debe estar cerrada (estado actual: ${raffle.status})`,
        participants: [],
        prizesCount: 0,
        activePassesCount: 0,
      }
    }

    // 4. Verificar si ya hay ganadores
    const existingWinners = await this.drawService.getWinnersCount(raffleId)
    if (existingWinners > 0) {
      return {
        canDraw: false,
        reason: 'El sorteo ya ha sido ejecutado',
        participants: [],
        prizesCount: 0,
        activePassesCount: 0,
      }
    }

    // 5. Obtener participantes únicos (usuarios con LuckyPasses activos)
    const participants = await this.getUniqueParticipants(raffleId)

    // 6. Contar premios desbloqueados
    const prizesCount = await this.drawService.getUnlockedPrizesCount(raffleId)

    // 7. Contar LuckyPasses activos
    const activePassesCount = participants.reduce((total, p) => total + p.luckyPassIds.length, 0)

    // 8. Validaciones finales
    if (participants.length === 0) {
      return {
        canDraw: false,
        reason: 'No hay participantes en la rifa',
        participants: [],
        prizesCount: 0,
        activePassesCount: 0,
      }
    }

    if (prizesCount === 0) {
      return {
        canDraw: false,
        reason: 'No hay premios desbloqueados',
        participants,
        prizesCount: 0,
        activePassesCount,
      }
    }

    return {
      canDraw: true,
      participants,
      prizesCount,
      activePassesCount,
    }
  }

  /**
   * Ejecuta el sorteo para un customer
   */
  async executeCustomerDraw(
    raffleId: string,
    customerUserId: string,
  ): Promise<CustomerDrawResult> {
    this.logger.log(`Customer ${customerUserId} ejecutando sorteo para rifa ${raffleId}`)

    // 1. Verificar disponibilidad
    const availability = await this.checkCustomerDrawAvailability(raffleId, customerUserId)
    if (!availability.canDraw) {
      throw new BadRequestException(availability.reason)
    }

    // 2. Ejecutar sorteo usando el servicio existente
    const drawResult = await this.drawService.executeDraw(raffleId, customerUserId)

    // 2. Mapear resultado al formato de customer
    const winners = await Promise.all(
      (drawResult.winners || []).map(async (winner: DrawWinner) => {
        const user = await this.getUserDetails(winner.userId)
        return {
          userId: winner.userId,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          prizeId: winner.prizeId,
          prizeName: winner.prizeName,
          luckyPassId: winner.luckyPassId,
        }
      }),
    )

    const discarded = await Promise.all(
      (drawResult.discarded || []).map(async (discarded: DrawDiscarded) => {
        const user = await this.getUserDetails(discarded.userId)
        return {
          userId: discarded.userId,
          email: user?.email,
          firstName: user?.firstName,
          lastName: user?.lastName,
          luckyPassId: discarded.luckyPassId,
        }
      }),
    )

    return { winners, discarded }
  }

  /**
   * Valida que el customer sea dueño de la rifa (misma organización)
   */
  private async validateCustomerOwnership(raffleId: string, customerUserId: string): Promise<UserDetails> {
    const raffleWithOrg = await this.rafflesRepository.findUnique(
      { id: raffleId },
      { organization: true },
    ) as RaffleWithOrg | null

    if (!raffleWithOrg) {
      throw new NotFoundException('Rifa no encontrada')
    }

    const customerUser = await this.getUserDetails(customerUserId)
    if (!customerUser) {
      throw new NotFoundException('Usuario no encontrado')
    }

    if (customerUser.role !== 'customer') {
      throw new ForbiddenException('Solo los customers pueden realizar sorteos')
    }

    if (customerUser.organizationId !== raffleWithOrg.organizationId) {
      throw new ForbiddenException('No puedes realizar sorteos de rifas que no pertenecen a tu organización')
    }

    return customerUser
  }

  /**
   * Obtiene participantes únicos (usuarios con LuckyPasses activos)
   */
  private async getUniqueParticipants(raffleId: string): Promise<CustomerDrawParticipant[]> {
    // Esta query agrupa por usuario para obtener participantes únicos
    const participants = await this.rafflesRepository.getUniqueParticipants(raffleId)
    return participants
  }

  /**
   * Obtiene detalles de un usuario
   */
  private async getUserDetails(userId: string): Promise<UserDetails> {
    const user = await this.rafflesRepository.getUserById(userId)
    if (!user) {
      throw new NotFoundException(`Usuario ${userId} no encontrado`)
    }
    return user
  }
}
