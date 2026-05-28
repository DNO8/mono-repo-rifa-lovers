import { Injectable , NotFoundException, BadRequestException } from '@nestjs/common'
import { randomInt } from 'crypto'
import { PrismaService } from '../../database/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'

export interface DrawResult {
  raffleId: string
  drawnAt: Date
  winners: {
    prizeId: string
    prizeName: string
    prizeDescription: string | null
    luckyPassId: string
    passNumber: number
    userId: string
    winnerName: string | null
    userName: string | null
    userEmail: string | null
  }[]
  discarded: {
    luckyPassId: string
    passNumber: number
    userId: string
    userName: string | null
    userEmail: string | null
  }[]
  isComplete?: boolean
}

export interface AdminDrawResult extends DrawResult {
  winners: (DrawResult['winners'][number] & {
    userPhone: string | null
    userAddress: string | null
  })[]
}

@Injectable()
export class DrawService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  private buildUserFullName(user: { firstName?: string | null; lastName?: string | null } | null): string | null {
    if (!user) return null
    const { firstName, lastName } = user
    if (firstName && lastName) return `${firstName} ${lastName}`
    return firstName || lastName || null
  }

  /**
   * Ejecuta el sorteo de un premio específico o el primer premio pendiente
   */
  async executeDraw(raffleId: string, adminUserId: string, prizeId?: string): Promise<DrawResult> {

    // 1. Validar que la rifa existe y está en estado 'closed'
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    if (raffle.status !== 'closed') {
      throw new BadRequestException(`La rifa debe estar cerrada para ejecutar el sorteo (estado actual: ${raffle.status})`)
    }

    // DEBUG: Ver todos los premios de la rifa
    const allPrizes = await this.prisma.prize.findMany({
      where: { raffleId: raffleId },
      include: { 
        milestone: true,
        prizeWinners: true 
      },
      orderBy: { milestone: { sortOrder: 'asc' } }
    })
    
    allPrizes.forEach((p, idx) => {
    })

    // 2. Obtener el premio a sortear
    let prizeToDraw: { id: string; name: string | null; description: string | null; milestone: { sortOrder: number } | null } | null = null
    
    if (prizeId) {
      // Sortear premio específico
      prizeToDraw = await this.prisma.prize.findFirst({
        where: {
          id: prizeId,
          raffleId: raffleId,
          milestone: { isUnlocked: true },
        },
        include: { milestone: true },
      })
      
      if (!prizeToDraw) {
        throw new BadRequestException('El premio especificado no existe o no está desbloqueado')
      }
    } else {
      // Obtener el primer premio pendiente (sin ganador)
      const prizes = await this.prisma.prize.findMany({
        where: {
          raffleId: raffleId,
          milestone: { isUnlocked: true },
          prizeWinners: { none: {} }, // Sin ganadores
        },
        include: { milestone: true },
        orderBy: { milestone: { sortOrder: 'asc' } },
        take: 1,
      })
      
      if (prizes.length === 0) {
        throw new BadRequestException('No hay premios pendientes para sortear')
      }
      
      prizeToDraw = prizes[0]
    }

    // 3. Verificar que el premio no tenga ganador
    const existingWinner = await this.prisma.prizeWinner.findFirst({
      where: { prizeId: prizeToDraw.id },
    })
    
    if (existingWinner) {
      throw new BadRequestException('Este premio ya tiene un ganador asignado')
    }


    // Safety: prizeToDraw is guaranteed non-null at this point
    const prize = prizeToDraw

    // 5. Ejecutar sorteo para el premio (todo dentro de la transacción para atomicidad)
    const { winner, isComplete } = await this.prisma.$transaction(async (tx) => {
      // 5.1 Lock de la rifa para prevenir sorteos concurrentes
      await tx.$queryRaw`
        SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
      `

      // 5.2 Obtener LuckyPasses activos para esta rifa (excluyendo los que ya ganaron)
      const usedPassIdsRaw = await tx.prizeWinner.findMany({
        where: {
          prize: { raffleId: raffleId },
        },
        select: { luckyPassId: true },
      })
      const usedPassIds = new Set(usedPassIdsRaw.map(w => w.luckyPassId).filter((id): id is string => id !== null))

      const activePasses = await tx.luckyPass.findMany({
        where: {
          raffleId: raffleId,
          status: 'active',
          id: { notIn: Array.from(usedPassIds) },
        },
        include: { user: true },
      })

      if (activePasses.length === 0) {
        throw new BadRequestException('No hay LuckyPasses activos disponibles para el sorteo')
      }


      // Seleccionar ganador aleatoriamente y obtener con usuario
      const winnerIndex = randomInt(0, activePasses.length)
      const winnerPassId = activePasses[winnerIndex].id

      const winnerPassWithUser = await tx.luckyPass.findUnique({
        where: { id: winnerPassId },
        include: { user: true }
      })

      if (!winnerPassWithUser) {
        throw new Error('LuckyPass no encontrado')
      }

      const winnerPass = winnerPassWithUser

      // Crear registro de ganador
      await tx.prizeWinner.create({
        data: {
          prizeId: prize.id,
          luckyPassId: winnerPass.id,
          userId: winnerPass.userId,
        },
      })

      // Marcar LuckyPass como ganador
      await tx.luckyPass.update({
        where: { id: winnerPass.id },
        data: {
          status: 'winner',
          isWinner: true,
        },
      })

      const userFullName = this.buildUserFullName(winnerPass.user)


      // Verificar si quedan premios pendientes (dentro de la transacción para atomicidad)
      const pendingPrizes = await tx.prize.count({
        where: {
          raffleId: raffleId,
          milestone: { isUnlocked: true },
          prizeWinners: { none: {} },
        },
      })

      const drawIsComplete = pendingPrizes === 0

      if (drawIsComplete) {
        // Marcar todos los LuckyPasses restantes activos como usados
        await tx.luckyPass.updateMany({
          where: {
            raffleId: raffleId,
            status: 'active',
          },
          data: { status: 'used' },
        })

        // Actualizar estado de la rifa a 'drawn'
        await tx.raffle.update({
          where: { id: raffleId },
          data: { status: 'drawn' },
        })

      } else {
      }

      return {
        winner: {
          prizeId: prize.id,
          prizeName: prize.name || 'Premio sin nombre',
          prizeDescription: prize.description,
          luckyPassId: winnerPass.id,
          passNumber: winnerPass.ticketNumber ?? 0,
          userId: winnerPass.userId ?? '',
          winnerName: userFullName,
          userName: userFullName,
          userEmail: winnerPass.user?.email ?? null,
        },
        isComplete: drawIsComplete,
      }
    })

    const result: DrawResult & { isComplete: boolean } = {
      raffleId,
      drawnAt: new Date(),
      winners: [winner],
      discarded: [],
      isComplete,
    }

    // Send winner notification email (non-blocking)
    if (winner.userEmail) {
      void this.notifications.sendWinnerEmail({
        toEmail: winner.userEmail,
        toName: winner.userName ?? 'Ganador',
        prizeName: winner.prizeName,
        passNumber: winner.passNumber,
        raffleName: raffle.title ?? null,
      })
    }

    return result
  }

  /**
   * Obtiene los resultados del sorteo de una rifa
   */
  async getDrawResults(raffleId: string): Promise<DrawResult | null> {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffleId} no encontrada`)
    }

    if (raffle.status !== 'drawn') {
      return null // El sorteo aún no se ha ejecutado
    }

    const winners = await this.prisma.prizeWinner.findMany({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
      include: {
        prize: { include: { milestone: true } },
        luckyPass: true,
        user: true,
      },
      orderBy: {
        prize: { milestone: { sortOrder: 'asc' } },
      },
    })

    return {
      raffleId,
      drawnAt: winners[0]?.createdAt || new Date(),
      winners: winners.map((w) => {
        const userFullName = this.buildUserFullName(w.user ?? null)

        return {
          prizeId: w.prizeId || '',
          prizeName: w.prize?.name || 'Premio sin nombre',
          prizeDescription: w.prize?.description || null,
          luckyPassId: w.luckyPassId || '',
          passNumber: w.luckyPass?.ticketNumber ?? 0,
          userId: w.userId || '',
          winnerName: userFullName,
          userName: userFullName,
          userEmail: w.user?.email ?? null,
        }
      }),
      discarded: [], // Por ahora vacío, se puede implementar lógica de descarte después
    }
  }

  /**
   * Obtiene los resultados del sorteo con datos personales completos para operador/admin
   */
  async getAdminDrawResults(raffleId: string): Promise<AdminDrawResult | null> {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffleId} no encontrada`)
    }

    if (raffle.status !== 'drawn') {
      return null // El sorteo aún no se ha ejecutado
    }

    const winners = await this.prisma.prizeWinner.findMany({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
      include: {
        prize: { include: { milestone: true } },
        luckyPass: true,
        user: true,
      },
      orderBy: {
        prize: { milestone: { sortOrder: 'asc' } },
      },
    })

    return {
      raffleId,
      drawnAt: winners[0]?.createdAt || new Date(),
      winners: winners.map((w) => {
        const userFullName = this.buildUserFullName(w.user ?? null)

        return {
          prizeId: w.prizeId || '',
          prizeName: w.prize?.name || 'Premio sin nombre',
          prizeDescription: w.prize?.description || null,
          luckyPassId: w.luckyPassId || '',
          passNumber: w.luckyPass?.ticketNumber ?? 0,
          userId: w.userId || '',
          winnerName: userFullName,
          userName: userFullName,
          userEmail: w.user?.email ?? null,
          userPhone: w.user?.phone ?? null,
          userAddress: w.user?.address ?? null,
        }
      }),
      discarded: [],
    }
  }

  /**
   * Verifica si un sorteo puede ejecutarse
   */
  async canExecuteDraw(raffleId: string): Promise<{
    canDraw: boolean
    reason?: string
    prizesCount: number
    activePassesCount: number
    winnersCount?: number
    pendingPrizesCount?: number
  }> {
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      return { canDraw: false, reason: 'Rifa no encontrada', prizesCount: 0, activePassesCount: 0 }
    }

    if (raffle.status !== 'closed') {
      return {
        canDraw: false,
        reason: `La rifa debe estar cerrada (estado actual: ${raffle.status})`,
        prizesCount: 0,
        activePassesCount: 0,
      }
    }

    // Contar premios desbloqueados
    const prizes = await this.prisma.prize.count({
      where: {
        raffleId: raffleId,
        milestone: {
          isUnlocked: true,
        },
      },
    })

    // Verificar si ya hay ganadores y contar premios pendientes
    const existingWinners = await this.prisma.prizeWinner.count({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
    })

    // Solo bloquear si TODOS los premios desbloqueados ya tienen ganador
    if (existingWinners >= prizes && prizes > 0) {
      return {
        canDraw: false,
        reason: 'Todos los premios ya han sido asignados',
        prizesCount: prizes,
        activePassesCount: 0,
        winnersCount: existingWinners,
        pendingPrizesCount: 0,
      }
    }

    // Contar passes activos
    const activePasses = await this.prisma.luckyPass.count({
      where: {
        raffleId: raffleId,
        status: 'active',
      },
    })

    if (prizes === 0) {
      return {
        canDraw: false,
        reason: 'No hay premios desbloqueados',
        prizesCount: 0,
        activePassesCount: activePasses,
      }
    }

    if (activePasses === 0) {
      return {
        canDraw: false,
        reason: 'No hay LuckyPasses activos',
        prizesCount: prizes,
        activePassesCount: 0,
      }
    }

    return {
      canDraw: true,
      prizesCount: prizes,
      activePassesCount: activePasses,
      winnersCount: existingWinners,
      pendingPrizesCount: prizes - existingWinners,
    }
  }

  /**
   * Obtiene el conteo de ganadores existentes para una rifa
   */
  async getWinnersCount(raffleId: string): Promise<number> {
    return this.prisma.prizeWinner.count({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
    })
  }

  /**
   * Obtiene el conteo de premios desbloqueados para una rifa
   */
  async getUnlockedPrizesCount(raffleId: string): Promise<number> {
    return this.prisma.prize.count({
      where: {
        raffleId: raffleId,
        milestone: {
          isUnlocked: true,
        },
      },
    })
  }

  /**
   * Resetea el sorteo de una rifa para permitir re-sortear
   * Elimina los ganadores, cambia el estado a 'closed', y resetea los lucky passes
   */
  async resetDraw(raffleId: string, operatorId: string) {
    void operatorId // reservado para auditoría futura
    // Verificar que la rifa existe y está en estado 'drawn'
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    if (raffle.status !== 'drawn') {
      throw new BadRequestException(`La rifa no está en estado 'drawn' (estado actual: ${raffle.status})`)
    }

    // Usar transacción para asegurar consistencia
    await this.prisma.$transaction(async (tx) => {
      // 1. Obtener todos los prizes de esta rifa
      const prizes = await tx.prize.findMany({
        where: { raffleId },
        select: { id: true },
      })
      const prizeIds = prizes.map((p) => p.id)

      // 2. Eliminar los prizeWinners asociados a estos prizes
      if (prizeIds.length > 0) {
        await tx.prizeWinner.deleteMany({
          where: {
            prizeId: {
              in: prizeIds,
            },
          },
        })
      }

      // 3. Resetear los lucky passes de esta rifa (isWinner: false, status: active)
      await tx.luckyPass.updateMany({
        where: { raffleId },
        data: {
          status: 'active',
          isWinner: false,
        },
      })

      // 4. Cambiar el estado de la rifa a 'closed'
      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: 'closed',
        },
      })

      // 5. Auditoría implícita en la transacción
    })

    return {
      success: true,
      message: 'Sorteo reiniciado correctamente',
      raffleId,
    }
  }
}
