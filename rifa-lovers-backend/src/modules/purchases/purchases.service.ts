import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PurchasesRepository } from './purchases.repository'
import { PacksRepository } from '../packs/packs.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { PrismaService } from '../../database/prisma.service'
import { ResendService } from '../email/resend.service'
import { CreatePurchaseDto, PurchaseResponseDto, CreatePurchaseResponseDto, RecentPurchaseDto } from './dto'
import { Purchase, Raffle, UserPack, Pack } from '@prisma/client'
import { mapPurchaseToDto } from './mappers/purchase.mapper'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// Tipo que incluye la relación raffle

type PurchaseWithRaffle = Purchase & { raffle: Raffle | null; userPacks?: (UserPack & { pack: Pack | null })[] }

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name)

  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly packsRepository: PacksRepository,
    private readonly rafflesRepository: RafflesRepository,
    private readonly prisma: PrismaService,
    private readonly resendService: ResendService,
  ) {}

  async findByUser(userId: string): Promise<PurchaseResponseDto[]> {
    this.logger.debug(`Buscando compras del usuario: ${userId}`)

    const purchases = await this.purchasesRepository.findByUser(userId, {
      raffle: true,
      userPacks: { include: { pack: true } },
    })

    this.logger.debug(`Encontradas ${purchases.length} compras para el usuario ${userId}`)

    return purchases.map((purchase) => mapPurchaseToDto(purchase as PurchaseWithRaffle))
  }

  async create(userId: string, createDto: CreatePurchaseDto): Promise<CreatePurchaseResponseDto> {
    this.logger.debug(`Creando compra: userId=${userId}, raffleId=${createDto.raffleId}, packId=${createDto.packId}, qty=${createDto.quantity}`)

    // 1. Validar que los datos necesarios están presentes
    if (!createDto.raffleId) {
      throw new BadRequestException('El ID de la rifa es requerido')
    }
    if (!createDto.packId) {
      throw new BadRequestException('El ID del pack es requerido')
    }
    if (!createDto.quantity || createDto.quantity < 1) {
      throw new BadRequestException('La cantidad debe ser al menos 1')
    }

    // 2. Validar que la rifa existe y está activa
    const raffle = await this.rafflesRepository.findUnique({ id: createDto.raffleId })
    if (!raffle) {
      throw new NotFoundException('Rifa no encontrada')
    }
    if (raffle.status !== 'active') {
      throw new BadRequestException(`La rifa no está activa (estado: ${raffle.status})`)
    }

    // 3. Validar que el pack existe
    const pack = await this.packsRepository.findUnique({ id: createDto.packId })
    if (!pack) {
      throw new NotFoundException('Pack no encontrado')
    }
    if (!pack.price) {
      throw new BadRequestException('El pack no tiene precio definido')
    }

    // 4. Calcular el total
    const unitPrice = pack.price.toNumber()
    const totalAmount = unitPrice * createDto.quantity

    try {
      // 5. Crear Purchase + UserPack + PaymentTransaction en transacción
      const result = await this.purchasesRepository.createFullPurchase({
        userId,
        raffleId: createDto.raffleId,
        packId: createDto.packId,
        quantity: createDto.quantity,
        totalAmount,
        selectedNumbers: createDto.selectedNumbers,
        pack,
      })

      this.logger.log(`Compra creada exitosamente: ${result.purchase.id}`)

      return {
        id: result.purchase.id,
        raffleId: raffle.id,
        raffleName: raffle.title || 'Rifa sin nombre',
        totalAmount,
        status: 'pending',
        createdAt: result.purchase.createdAt.toISOString(),
        // TODO: Integrar con Flow para obtener flowOrderId y paymentUrl
        flowOrderId: undefined,
        paymentUrl: undefined,
        packName: pack.name || 'Pack sin nombre',
        quantity: createDto.quantity,
        unitPrice,
        luckyPassCount: createDto.quantity * (pack.luckyPassQuantity ?? 1),
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error'
      const stack = error instanceof Error ? error.stack : undefined
      this.logger.error(`Error creando compra: ${msg}`, stack)
      throw error
    }
  }

  async findById(id: string): Promise<PurchaseResponseDto> {
    this.logger.debug(`Buscando compra por ID: ${id}`)

    const purchase = await this.purchasesRepository.findUnique(
      { id },
      { raffle: true },
    )

    if (!purchase) {
      this.logger.warn(`Compra no encontrada: ${id}`)
      throw new NotFoundException(`Compra con ID ${id} no encontrada`)
    }

    return mapPurchaseToDto(purchase as PurchaseWithRaffle)
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'paid' | 'failed' | 'refunded',
  ): Promise<PurchaseResponseDto> {
    this.logger.debug(`Actualizando estado de compra ${id} a: ${status}`)

    const purchase = await this.purchasesRepository.updateStatus(
      id,
      status,
      status === 'paid' ? new Date() : undefined,
    )

    this.logger.log(`Estado de compra ${id} actualizado a: ${status}`)

    // Obtener la compra actualizada con la relación
    const purchaseWithRaffle = await this.purchasesRepository.findUnique(
      { id: purchase.id },
      { raffle: true },
    )

    if (!purchaseWithRaffle) {
      throw new NotFoundException('Error al recuperar la compra actualizada')
    }

    return mapPurchaseToDto(purchaseWithRaffle as PurchaseWithRaffle)
  }

  async confirmPayment(
    purchaseId: string,
    paymentData: {
      providerTransactionId: string
      provider: string
      status: string
    },
  ): Promise<PurchaseResponseDto> {
    this.logger.debug(`Confirmando pago para compra: ${purchaseId}`)

    // 0. Idempotencia: verificar que la compra no ya fue confirmada
    const existing = await this.purchasesRepository.findUnique(
      { id: purchaseId },
      { raffle: true, userPacks: { include: { pack: true } } },
    )
    if (!existing) {
      throw new NotFoundException(`Compra ${purchaseId} no encontrada`)
    }
    if (existing.status === 'paid') {
      this.logger.warn(`Compra ${purchaseId} ya fue confirmada, ignorando duplicado`)
      return mapPurchaseToDto(existing as PurchaseWithRaffle)
    }

    // Transacción única: marcar como paid + generar LuckyPasses (atomicidad total)
    await this.prisma.$transaction(async (tx) => {
      // 1. Marcar compra y transacción como pagadas
      await tx.purchase.update({
        where: { id: purchaseId },
        data: { status: 'paid', paidAt: new Date() },
      })
      await tx.paymentTransaction.updateMany({
        where: { purchaseId, status: { not: 'approved' } },
        data: {
          providerTransactionId: paymentData.providerTransactionId,
          status: 'approved',
        },
      })

      // 2. Generar LuckyPasses para cada UserPack
      const userPacks = await tx.userPack.findMany({
        where: { purchaseId },
        include: { pack: true },
      })

      const raffleId = existing.raffleId
      if (!raffleId) {
        throw new BadRequestException('La compra no tiene rifa asociada')
      }

      // 3. Obtener tickets reservados para esta compra (dentro de la transacción)
      const reservedTickets = await tx.$queryRaw<{ ticket_number: number }[]>`
        SELECT ticket_number FROM public.ticket_reservations
        WHERE purchase_id = ${purchaseId}::uuid
      `
      const reservedNumbers = reservedTickets.map((r) => r.ticket_number)
      this.logger.debug(`Tickets reservados para purchase=${purchaseId}: ${reservedNumbers.join(', ')}`)

      // 4. Lock raffle row para asignación secuencial de tickets sin reserva
      await tx.$queryRaw`
        SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
      `

      // 5. Obtener siguiente ticket disponible para asignación secuencial
      const maxResult = await tx.$queryRaw<[{ max_ticket: string | null }]>`
        SELECT MAX(ticket_number)::text AS max_ticket
        FROM public.lucky_passes
        WHERE raffle_id = ${raffleId}::uuid
      `
      const rawMax = maxResult[0]?.max_ticket
      let nextTicket = (rawMax ? parseInt(rawMax, 10) : 0) + 1

      let totalLuckyPasses = 0
      let reservedNumbersIdx = 0

      for (const userPack of userPacks) {
        const pack = userPack.pack
        if (!pack) continue

        const count = userPack.quantity * pack.luckyPassQuantity
        totalLuckyPasses += count

        const luckyPassData: {
          raffleId: string
          userId: string | null
          userPackId: string
          ticketNumber: number
          status: 'active'
          isWinner: boolean
        }[] = []

        for (let i = 0; i < count; i++) {
          let ticketNumber: number
          if (reservedNumbersIdx < reservedNumbers.length) {
            // Usar número reservado
            ticketNumber = reservedNumbers[reservedNumbersIdx++]
          } else {
            // Asignación secuencial para tickets sin número preferido
            ticketNumber = nextTicket++
          }
          if (!ticketNumber || isNaN(ticketNumber) || ticketNumber < 1) {
            throw new BadRequestException(`Número de ticket inválido generado: ${ticketNumber}`)
          }
          luckyPassData.push({
            raffleId,
            userId: existing.userId,
            userPackId: userPack.id,
            ticketNumber,
            status: 'active',
            isWinner: false,
          })
        }

        await tx.luckyPass.createMany({ data: luckyPassData })
        this.logger.debug(`Generados ${count} LuckyPasses para userPack ${userPack.id}`)
      }

      // 6. Liberar reservas usadas (ya convertidas a LuckyPasses)
      if (reservedNumbers.length > 0) {
        await tx.$executeRaw`
          DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
        `
        this.logger.debug(`Reservas liberadas para purchase=${purchaseId}`)
      }

      // 7. Actualizar raffle_progress
      const raffle = await tx.raffle.findUnique({ where: { id: raffleId } })
      const totalQuantity = userPacks.reduce((sum, up) => sum + up.quantity, 0)
      const totalAmount = existing.totalAmount?.toNumber() ?? 0

      await tx.raffleProgress.upsert({
        where: { raffleId },
        create: {
          raffleId,
          packsSold: totalQuantity,
          revenueTotal: totalAmount,
          percentageToGoal: raffle
            ? (totalQuantity / raffle.goalPacks) * 100
            : 0,
        },
        update: {
          packsSold: { increment: totalQuantity },
          revenueTotal: { increment: totalAmount },
        },
      })

      // Recalcular percentage_to_goal con el valor actualizado de packsSold
      if (raffle) {
        const updatedProgress = await tx.raffleProgress.findUnique({
          where: { raffleId },
        })
        if (updatedProgress) {
          const pctGoal = (updatedProgress.packsSold / raffle.goalPacks) * 100
          await tx.raffleProgress.update({
            where: { raffleId },
            data: { percentageToGoal: pctGoal },
          })
        }
      }

      // 8. Desbloquear milestones automáticamente según packsSold actualizado
      if (raffle) {
        const updatedProgress = await tx.raffleProgress.findUnique({ where: { raffleId } })
        if (updatedProgress) {
          await tx.milestone.updateMany({
            where: {
              raffleId,
              isUnlocked: false,
              requiredPacks: { lte: updatedProgress.packsSold },
            },
            data: { isUnlocked: true },
          })
        }
      }

      this.logger.log(
        `Pago confirmado: purchase=${purchaseId}, luckyPasses=${totalLuckyPasses}, packsSold=${totalQuantity}`,
      )
    })

    // Obtener la compra actualizada con relaciones completas
    const purchaseWithDetails = await this.prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: {
        raffle: true,
        user: { select: { email: true, firstName: true, lastName: true } },
        userPacks: {
          include: {
            pack: true,
            luckyPasses: { select: { ticketNumber: true } },
          },
        },
      },
    })

    if (!purchaseWithDetails) {
      throw new NotFoundException('Error al recuperar la compra actualizada')
    }

    // Enviar email de confirmación (async - no bloquea respuesta)
    if (purchaseWithDetails.user?.email) {
      const userName = purchaseWithDetails.user.firstName
        ? `${purchaseWithDetails.user.firstName} ${purchaseWithDetails.user.lastName || ''}`.trim()
        : 'Comprador'

      const ticketNumbers = purchaseWithDetails.userPacks.flatMap((up) =>
        up.luckyPasses.map((lp) => lp.ticketNumber).filter((n): n is number => n !== null),
      )

      const pack = purchaseWithDetails.userPacks[0]?.pack
      const packName = pack?.name || 'Pack'
      const quantity = purchaseWithDetails.userPacks.reduce((sum, up) => sum + up.quantity, 0)
      const luckyPassCount = ticketNumbers.length
      const totalAmount = purchaseWithDetails.totalAmount?.toNumber() ?? 0
      const raffleName = purchaseWithDetails.raffle?.title || 'Rifa'

      // Fire-and-forget: no bloquear respuesta al webhook
      this.resendService
        .sendPurchaseConfirmation({
          toEmail: purchaseWithDetails.user.email,
          toName: userName,
          purchaseId: purchaseWithDetails.id,
          raffleName,
          packName,
          quantity,
          totalAmount,
          luckyPassCount,
          ticketNumbers,
        })
        .catch((err) => {
          this.logger.error(`Error enviando email de compra: ${err}`)
        })
    }

    return mapPurchaseToDto(purchaseWithDetails as PurchaseWithRaffle)
  }

  /**
   * Busca una compra por el providerTransactionId de su PaymentTransaction
   * Usado por webhooks para encontrar la compra asociada a un token de Flow
   */
  async findByProviderTransactionId(providerTransactionId: string) {
    const paymentTx = await this.prisma.paymentTransaction.findFirst({
      where: { providerTransactionId },
      include: { purchase: true },
    })
    return paymentTx?.purchase ?? null
  }

  /**
   * Obtiene las últimas 10 compras pagadas para el ticker en vivo
   * Incluye nombre del usuario y cantidad real de LuckyPasses generados
   */
  async getRecentPurchases(): Promise<RecentPurchaseDto[]> {
    this.logger.debug('Obteniendo compras recientes para ticker')

    const purchases = await this.prisma.purchase.findMany({
      where: { status: 'paid', paidAt: { not: null } },
      orderBy: { paidAt: 'desc' },
      take: 10,
      include: {
        user: { select: { firstName: true, lastName: true } },
        userPacks: {
          include: {
            luckyPasses: { select: { id: true } },
          },
        },
      },
    })

    return purchases
      .map((purchase) => {
        const firstName = purchase.user?.firstName ?? 'Usuario'
        const lastName = purchase.user?.lastName ?? ''
        const lastNameInitial = lastName.charAt(0)
        const name = lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName

        // Count actual LuckyPasses generated across all userPacks in this purchase
        const ticketCount = purchase.userPacks.reduce(
          (sum, userPack) => sum + userPack.luckyPasses.length,
          0
        )

        // Format time ago in Spanish
        const timeAgo = purchase.paidAt
          ? formatDistanceToNow(new Date(purchase.paidAt), {
              addSuffix: true,
              locale: es,
            })
          : 'hace un momento'

        return {
          id: purchase.id,
          name,
          action: 'compró',
          ticketCount,
          timeAgo,
          city: 'Santiago', // Mock for now
        }
      })
      .filter((purchase) => purchase.ticketCount > 0)
  }
}
