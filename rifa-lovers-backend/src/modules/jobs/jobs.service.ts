import { Injectable , OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { RaffleStatus, PurchaseStatus, Prisma } from '@prisma/client'
import { RaffleSchedulerService } from '../raffles/raffle-scheduler.service'
import { TicketReservationsRepository } from '../ticket-reservations/ticket-reservations.repository'
import { ResendService } from '../email/resend.service'
import { FlowService } from '../payments/flow.service'
import { PurchasesService } from '../purchases/purchases.service'
import * as cron from 'node-cron'

@Injectable()
export class JobsService implements OnModuleInit, OnModuleDestroy {
  private tasks: cron.ScheduledTask[] = []

  constructor(
    private readonly prisma: PrismaService,
    private readonly raffleSchedulerService: RaffleSchedulerService,
    private readonly ticketReservationsRepository: TicketReservationsRepository,
    private readonly resendService: ResendService,
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
  ) {}

  onModuleInit() {
    
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
    
    // Check pending payments status - cada 3 minutos (early detection de rechazos/anulaciones)
    this.tasks.push(
      cron.schedule('*/3 * * * *', () => {
        void this.checkPendingPaymentsStatus()
      })
    )

    // Expire Purchases - cada 15 minutos
    this.tasks.push(
      cron.schedule('*/15 * * * *', () => {
        void this.expirePendingPurchases()
      })
    )
    
    // Auto Close by EndDate - cada minuto
    this.tasks.push(
      cron.schedule('* * * * *', () => {
        void this.closeExpiredRafflesByEndDate()
      })
    )

    // Expire Ticket Reservations - cada minuto
    this.tasks.push(
      cron.schedule('* * * * *', () => {
        void this.expireTicketReservations()
      })
    )
    
  }

  onModuleDestroy() {
    for (const task of this.tasks) void task.stop()
  }

  /**
   * Auto SOLD_OUT - cada 5 minutos
   * Marca rifas como SOLD_OUT cuando se alcanza la meta de packs vendidos
   */
  async autoSoldOut(): Promise<void> {

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
        return
      }

      // Actualizar rifas a SOLD_OUT
      for (const raffle of rafflesToUpdate) {
        await this.prisma.raffle.update({
          where: { id: raffle.id },
          data: { status: RaffleStatus.sold_out },
        })

      }

    } catch (error) {
    }
  }

  /**
   * Auto CLOSED - cada 5 minutos
   * Cierra rifas cuando llega su fecha de finalización
   */
  async autoClosed(): Promise<void> {

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
        return
      }

      // Cerrar las rifas
      for (const raffle of rafflesToClose) {
        await this.prisma.raffle.update({
          where: { id: raffle.id },
          data: { status: RaffleStatus.closed },
        })

      }

    } catch (error) {
    }
  }

  /**
   * Expirar purchases no pagadas - cada 15 minutos
   * Marca como "failed" las compras pendientes de más de 15 minutos
   * (coincide con la expiración de ticket reservations)
   *
   * Procesa en lotes de 5 en paralelo para no saturar la API de Flow
   * ni exceder el timeout del cron job.
   */
  async expirePendingPurchases(): Promise<void> {

    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)

      // Buscar purchases pendientes de más de 15 minutos
      const purchasesToExpire = await this.prisma.purchase.findMany({
        where: {
          status: PurchaseStatus.pending,
          createdAt: {
            lt: fifteenMinutesAgo,
          },
        },
        select: {
          id: true,
          userId: true,
          totalAmount: true,
          createdAt: true,
          raffle: { select: { title: true } },
          user: { select: { email: true, firstName: true, lastName: true } },
          paymentTransactions: {
            select: { providerTransactionId: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (purchasesToExpire.length === 0) {
        return
      }

      // Procesar en lotes de 5 en paralelo (Promise.allSettled)
      const CONCURRENCY = 5
      const results = { confirmed: 0, failed: 0, errors: 0 }

      for (let i = 0; i < purchasesToExpire.length; i += CONCURRENCY) {
        const batch = purchasesToExpire.slice(i, i + CONCURRENCY)
        const batchResults = await Promise.allSettled(
          batch.map((purchase) => this.processExpiredPurchase(purchase)),
        )

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled') {
            if (result.value === 'confirmed') results.confirmed++
            else if (result.value === 'failed') results.failed++
          } else {
            results.errors++
          }
        })
      }

    } catch (error) {
    }
  }

  /**
   * Procesa un purchase expirado: consulta Flow y actualiza estado.
   * Extraído para poder ejecutar en paralelo con Promise.allSettled.
   */
  private async processExpiredPurchase(
    purchase: {
      id: string
      userId: string | null
      totalAmount: Prisma.Decimal | null
      createdAt: Date
      raffle: { title: string | null } | null
      user: { email: string | null; firstName: string | null; lastName: string | null } | null
      paymentTransactions: { providerTransactionId: string | null }[]
    },
  ): Promise<'confirmed' | 'failed'> {
    const token = purchase.paymentTransactions[0]?.providerTransactionId
    let flowStatus = 1

    if (token) {
      try {
        const paymentStatus = await this.flowService.getPaymentStatus(token)
        flowStatus = paymentStatus.status
      } catch (err) {
      }
    }

    if (flowStatus === 2) {
      // Flow confirma que el pago fue exitoso → confirmar compra
      try {
        await this.purchasesService.confirmPayment(purchase.id, {
          providerTransactionId: token ?? 'unknown',
          provider: 'flow',
          status: 'approved',
        })
        return 'confirmed'
      } catch (err) {
        throw err
      }
    }

    // Flow no confirma pago (1=pendiente, 3=rechazado, 4=anulado) → marcar como failed
    try {
      await this.prisma.purchase.update({
        where: { id: purchase.id },
        data: { status: PurchaseStatus.failed },
      })

      // Actualizar payment_transactions asociadas a 'rejected' y limpiar idempotencyKey
      await this.prisma.paymentTransaction.updateMany({
        where: { purchaseId: purchase.id },
        data: { status: 'rejected', idempotencyKey: null },
      })
    } catch (dbErr) {
      throw dbErr
    }

    // Enviar email según estado real de Flow
    try {
      const user = purchase.user
      if (user?.email) {
        if (flowStatus === 3 || flowStatus === 4) {
          void this.resendService.sendFailedPaymentEmail({
            toEmail: user.email,
            toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
            purchaseId: purchase.id,
            raffleName: purchase.raffle?.title ?? null,
            amount: Number(purchase.totalAmount ?? 0),
          })
        } else {
          void this.resendService.sendIncompletePaymentEmail({
            toEmail: user.email,
            toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
            purchaseId: purchase.id,
            raffleName: purchase.raffle?.title ?? null,
            amount: Number(purchase.totalAmount ?? 0),
          })
        }
      }
    } catch (err) {
    }

    return 'failed'
  }

  /**
   * Verificar estado de pagos pendientes de 3-15 minutos en Flow
   * Detecta rechazos/anulaciones temprano para notificar al usuario antes
   */
  async checkPendingPaymentsStatus(): Promise<void> {

    try {
      const now = Date.now()
      const threeMinutesAgo = new Date(now - 3 * 60 * 1000)
      const fifteenMinutesAgo = new Date(now - 15 * 60 * 1000)

      // Buscar purchases pendientes entre 3 y 15 minutos de antigüedad
      const purchasesToCheck = await this.prisma.purchase.findMany({
        where: {
          status: PurchaseStatus.pending,
          createdAt: {
            gte: fifteenMinutesAgo,
            lt: threeMinutesAgo,
          },
        },
        select: {
          id: true,
          userId: true,
          totalAmount: true,
          createdAt: true,
          raffle: { select: { title: true } },
          user: { select: { email: true, firstName: true, lastName: true } },
          paymentTransactions: {
            select: { providerTransactionId: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (purchasesToCheck.length === 0) {
        return
      }


      for (const purchase of purchasesToCheck) {
        const token = purchase.paymentTransactions[0]?.providerTransactionId
        if (!token) continue

        let flowStatus = 1
        try {
          const paymentStatus = await this.flowService.getPaymentStatus(token)
          flowStatus = paymentStatus.status
        } catch (err) {
          continue
        }

        if (flowStatus === 2) {
          // Pagado → confirmar
          try {
            await this.purchasesService.confirmPayment(purchase.id, {
              providerTransactionId: token,
              provider: 'flow',
              status: 'approved',
            })
          } catch (err) {
          }
        } else if (flowStatus === 3 || flowStatus === 4) {
          // Rechazado o anulado → marcar failed y notificar
          try {
            await this.prisma.purchase.update({
              where: { id: purchase.id },
              data: { status: PurchaseStatus.failed },
            })
            await this.prisma.paymentTransaction.updateMany({
              where: { purchaseId: purchase.id },
              data: { status: 'rejected', idempotencyKey: null },
            })
          } catch (dbErr) {
            continue
          }

          const user = purchase.user
          if (user?.email) {
            void this.resendService.sendFailedPaymentEmail({
              toEmail: user.email,
              toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
              purchaseId: purchase.id,
              raffleName: purchase.raffle?.title ?? null,
              amount: Number(purchase.totalAmount ?? 0),
            })
          }
        }
        // flowStatus === 1: sigue pendiente, no hacer nada
      }

    } catch (error) {
    }
  }

  /**
   * Close expired raffles by endDate - cada minuto
   */
  async closeExpiredRafflesByEndDate(): Promise<void> {
    try {
      const result = await this.raffleSchedulerService.closeExpiredRaffles()
      if (result.closed > 0) {
      }
      if (result.errors.length > 0) {
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
    }
  }

  /**
   * Expirar reservas de tickets vencidas - cada minuto
   */
  async expireTicketReservations(): Promise<void> {
    try {
      const deleted = await this.ticketReservationsRepository.deleteExpired()
      if (deleted > 0) {
      }
    } catch (error) {
    }
  }

  /**
   * Job manual para testing - ejecutar desde AdminController
   */
  async runJobManually(jobName: 'sold_out' | 'closed' | 'expire_purchases'): Promise<{ success: boolean; message: string }> {

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
