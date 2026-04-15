import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleStatus, PurchaseStatus } from '@prisma/client'
import * as cron from 'node-cron'

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobsService.name)
  private tasks: cron.ScheduledTask[] = []

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.logger.log('Inicializando jobs automáticos...')
    
    // Auto SOLD_OUT - cada 5 minutos
    this.tasks.push(
      cron.schedule('*/5 * * * *', () => {
        void this.autoSoldOut()
      })
    )
    
    // Auto CLOSED - cada 5 minutos, con 2 min de offset para evitar conflictos con SOLD_OUT
    this.tasks.push(
      cron.schedule('2-59/5 * * * *', () => {
        void this.autoClosed()
      })
    )
    
    // Expire Purchases - cada 15 minutos
    this.tasks.push(
      cron.schedule('*/15 * * * *', () => {
        void this.expirePendingPurchases()
      })
    )
    
    this.logger.log('✅ Jobs automáticos iniciados:')
    this.logger.log('   • Auto SOLD_OUT: cada 5 minutos')
    this.logger.log('   • Auto CLOSED: cada 5 minutos')
    this.logger.log('   • Expire Purchases: cada 15 minutos')
  }

  onModuleDestroy() {
    this.logger.log('Deteniendo jobs automáticos...')
    for (const task of this.tasks) void task.stop()
    this.logger.log('✅ Jobs detenidos')
  }

  /**
   * Auto SOLD_OUT - cada 5 minutos
   * Marca rifas como SOLD_OUT cuando se alcanza la meta de packs vendidos
   */
  async autoSoldOut(): Promise<void> {
    this.logger.log('[JOB] Ejecutando Auto SOLD_OUT...')

    try {
      // Buscar rifas activas que han alcanzado su meta
      const rafflesToUpdate = await this.prisma.$queryRaw<Array<{ id: string; title: string | null; packs_sold: number; goal_packs: number }>>`
        SELECT r.id, r.title, rp.packs_sold, r.goal_packs
        FROM raffles r
        JOIN raffle_progress rp ON r.id = rp.raffle_id
        WHERE r.status = ${RaffleStatus.active}
          AND rp.packs_sold >= r.goal_packs
      `

      if (rafflesToUpdate.length === 0) {
        this.logger.log('[JOB] Auto SOLD_OUT: No hay rifas para actualizar')
        return
      }

      // Actualizar rifas a SOLD_OUT
      for (const raffle of rafflesToUpdate) {
        await this.prisma.raffle.update({
          where: { id: raffle.id },
          data: { status: RaffleStatus.sold_out },
        })

        this.logger.log(
          `[JOB] Rifa "${raffle.title || 'Sin título'}" (${raffle.id}) marcada como SOLD_OUT (${raffle.packs_sold}/${raffle.goal_packs} packs)`
        )
      }

      this.logger.log(`[JOB] Auto SOLD_OUT completado: ${rafflesToUpdate.length} rifas actualizadas`)
    } catch (error) {
      this.logger.error('[JOB] Error en Auto SOLD_OUT:', error)
    }
  }

  /**
   * Auto CLOSED - cada 5 minutos
   * Cierra rifas cuando llega su fecha de finalización
   */
  async autoClosed(): Promise<void> {
    this.logger.log('[JOB] Ejecutando Auto CLOSED...')

    try {
      const now = new Date()

      // Buscar rifas activas o sold_out que han pasado su fecha de cierre
      const rafflesToClose = await this.prisma.raffle.findMany({
        where: {
          status: {
            in: [RaffleStatus.active, RaffleStatus.sold_out],
          },
          endDate: {
            lte: now,
          },
        },
        select: {
          id: true,
          title: true,
          status: true,
          endDate: true,
        },
      })

      if (rafflesToClose.length === 0) {
        this.logger.log('[JOB] Auto CLOSED: No hay rifas para cerrar')
        return
      }

      // Cerrar las rifas
      for (const raffle of rafflesToClose) {
        await this.prisma.raffle.update({
          where: { id: raffle.id },
          data: { status: RaffleStatus.closed },
        })

        this.logger.log(
          `[JOB] Rifa "${raffle.title || 'Sin título'}" (${raffle.id}) cerrada automáticamente (estaba: ${raffle.status})`
        )
      }

      this.logger.log(`[JOB] Auto CLOSED completado: ${rafflesToClose.length} rifas cerradas`)
    } catch (error) {
      this.logger.error('[JOB] Error en Auto CLOSED:', error)
    }
  }

  /**
   * Expirar purchases no pagadas - cada 15 minutos
   * Marca como "failed" las compras pendientes de más de 30 minutos
   */
  async expirePendingPurchases(): Promise<void> {
    this.logger.log('[JOB] Ejecutando expiración de purchases...')

    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)

      // Buscar purchases pendientes de más de 30 minutos
      const purchasesToExpire = await this.prisma.purchase.findMany({
        where: {
          status: PurchaseStatus.pending,
          createdAt: {
            lt: thirtyMinutesAgo,
          },
        },
        select: {
          id: true,
          userId: true,
          totalAmount: true,
          createdAt: true,
        },
      })

      if (purchasesToExpire.length === 0) {
        this.logger.log('[JOB] No hay purchases para expirar')
        return
      }

      // Expirar las purchases
      for (const purchase of purchasesToExpire) {
        await this.prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: PurchaseStatus.failed },
        })

        this.logger.log(
          `[JOB] Purchase ${purchase.id} expirada (creada: ${purchase.createdAt.toISOString()})`
        )
      }

      this.logger.log(`[JOB] Expiración completada: ${purchasesToExpire.length} purchases marcadas como failed`)
    } catch (error) {
      this.logger.error('[JOB] Error en expiración de purchases:', error)
    }
  }

  /**
   * Job manual para testing - ejecutar desde AdminController
   */
  async runJobManually(jobName: 'sold_out' | 'closed' | 'expire_purchases'): Promise<{ success: boolean; message: string }> {
    this.logger.log(`[JOB MANUAL] Ejecutando ${jobName} manualmente...`)

    try {
      switch (jobName) {
        case 'sold_out':
          await this.autoSoldOut()
          return { success: true, message: 'Job Auto SOLD_OUT ejecutado manualmente' }
        case 'closed':
          await this.autoClosed()
          return { success: true, message: 'Job Auto CLOSED ejecutado manualmente' }
        case 'expire_purchases':
          await this.expirePendingPurchases()
          return { success: true, message: 'Job Expirar Purchases ejecutado manualmente' }
        default:
          return { success: false, message: 'Job no válido' }
      }
    } catch (error) {
      this.logger.error(`[JOB MANUAL] Error ejecutando ${jobName}:`, error)
      return { success: false, message: `Error: ${error}` }
    }
  }

  /**
   * Obtener estado de los jobs (para monitoreo)
   */
  getJobsStatus(): {
    lastRun: { soldOut: Date | null; closed: Date | null; expirePurchases: Date | null }
    nextRun: { soldOut: Date; closed: Date; expirePurchases: Date }
  } {
    const now = new Date()
    
    // Calcular próximas ejecuciones (cron cada 5, 5, 15 min)
    const next5Min = new Date(Math.ceil(now.getTime() / (5 * 60 * 1000)) * (5 * 60 * 1000))
    const next15Min = new Date(Math.ceil(now.getTime() / (15 * 60 * 1000)) * (15 * 60 * 1000))

    return {
      lastRun: {
        soldOut: null, // Se podría almacenar en caché o BD
        closed: null,
        expirePurchases: null,
      },
      nextRun: {
        soldOut: next5Min,
        closed: next5Min,
        expirePurchases: next15Min,
      },
    }
  }
}
