import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common'
import { randomInt } from 'crypto'
import { PrismaService } from '../../database/prisma.service'

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
    userName: string | null
    userEmail: string | null
  }[]
}

@Injectable()
export class DrawService {
  private readonly logger = new Logger(DrawService.name)

  constructor(private readonly prisma: PrismaService) {}

  private buildUserFullName(user: { firstName?: string | null; lastName?: string | null } | null): string | null {
    if (!user) return null
    const { firstName, lastName } = user
    if (firstName && lastName) return `${firstName} ${lastName}`
    return firstName || lastName || null
  }

  /**
   * Ejecuta el sorteo de una rifa
   * Solo puede ejecutarse si la rifa está en estado 'closed'
   */
  async executeDraw(raffleId: string, adminUserId: string): Promise<DrawResult> {
    this.logger.log(`Iniciando sorteo para rifa: ${raffleId}, admin: ${adminUserId}`)

    // 1. Verificar que la rifa existe y está cerrada
    const raffle = await this.prisma.raffle.findUnique({
      where: { id: raffleId },
    })

    if (!raffle) {
      throw new NotFoundException(`Rifa con ID ${raffleId} no encontrada`)
    }

    if (raffle.status !== 'closed') {
      throw new BadRequestException(
        `No se puede ejecutar el sorteo. La rifa debe estar en estado 'closed' pero está en '${raffle.status}'`
      )
    }

    // 2. Verificar que no se haya ejecutado ya un sorteo
    const existingWinners = await this.prisma.prizeWinner.count({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
    })

    if (existingWinners > 0) {
      throw new BadRequestException('El sorteo ya ha sido ejecutado para esta rifa')
    }

    // 3. Obtener premios de milestones desbloqueados
    const prizes = await this.prisma.prize.findMany({
      where: {
        raffleId: raffleId,
        milestone: {
          isUnlocked: true,
        },
      },
      include: {
        milestone: true,
      },
      orderBy: {
        milestone: {
          sortOrder: 'asc',
        },
      },
    })

    if (prizes.length === 0) {
      throw new BadRequestException('No hay premios desbloqueados para sortear')
    }

    this.logger.log(`${prizes.length} premios disponibles para sorteo`)

    // 4. Obtener LuckyPasses activos para esta rifa
    const activePasses = await this.prisma.luckyPass.findMany({
      where: {
        raffleId: raffleId,
        status: 'active',
      },
      include: {
        user: true,
      },
    })

    if (activePasses.length === 0) {
      throw new BadRequestException('No hay LuckyPasses activos para participar en el sorteo')
    }

    this.logger.log(`${activePasses.length} LuckyPasses activos participando`)

    // 5. Ejecutar sorteo para cada premio (dentro de transacción para garantizar consistencia)
    const winners = await this.prisma.$transaction(async (tx) => {
      const drawWinners: DrawResult['winners'] = []
      const usedPassIds = new Set<string>()

      // Mezclar array de passes de forma aleatoria (Fisher-Yates)
      const shuffledPasses = [...activePasses]
      for (let i = shuffledPasses.length - 1; i > 0; i--) {
        const j = randomInt(0, i + 1)
        ;[shuffledPasses[i], shuffledPasses[j]] = [shuffledPasses[j], shuffledPasses[i]]
      }

      let passIndex = 0

      for (const prize of prizes) {
        // Buscar siguiente pass disponible
        while (passIndex < shuffledPasses.length && usedPassIds.has(shuffledPasses[passIndex].id)) {
          passIndex++
        }

        if (passIndex >= shuffledPasses.length) {
          this.logger.warn(`No hay suficientes LuckyPasses para todos los premios`)
          break
        }

        const winnerPass = shuffledPasses[passIndex]
        usedPassIds.add(winnerPass.id)

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

        const userFullName = this.buildUserFullName(winnerPass.user ?? null)

        drawWinners.push({
          prizeId: prize.id,
          prizeName: prize.name || 'Premio sin nombre',
          prizeDescription: prize.description,
          luckyPassId: winnerPass.id,
          passNumber: winnerPass.ticketNumber ?? 0,
          userId: winnerPass.userId ?? '',
          userName: userFullName,
          userEmail: winnerPass.user?.email ?? null,
        })

        this.logger.log(`Ganador asignado: Prize=${prize.name}, Pass=${winnerPass.ticketNumber}, User=${winnerPass.user?.email}`)

        passIndex++
      }

      // 6. Actualizar estado de la rifa a 'drawn'
      await tx.raffle.update({
        where: { id: raffleId },
        data: {
          status: 'drawn',
        },
      })

      this.logger.log(`Sorteo completado para rifa ${raffleId}. ${drawWinners.length} ganadores.`)

      return drawWinners
    })

    return {
      raffleId,
      drawnAt: new Date(),
      winners,
    }
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
        prize: true,
        luckyPass: true,
        user: true,
      },
      orderBy: {
        createdAt: 'asc',
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
          userName: userFullName,
          userEmail: w.user?.email ?? null,
        }
      }),
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

    // Verificar si ya hay ganadores
    const existingWinners = await this.prisma.prizeWinner.count({
      where: {
        prize: {
          raffleId: raffleId,
        },
      },
    })

    if (existingWinners > 0) {
      return {
        canDraw: false,
        reason: 'El sorteo ya ha sido ejecutado',
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
    }
  }
}
