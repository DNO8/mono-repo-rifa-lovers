import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { PurchasesRepository } from './purchases.repository'
import { PacksRepository } from '../packs/packs.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { PrismaService } from '../../database/prisma.service'
import { CreatePurchaseDto, PurchaseResponseDto, CreatePurchaseResponseDto } from './dto'
import { Purchase, Raffle, UserPack, Pack } from '@prisma/client'
import { mapPurchaseToDto } from './mappers/purchase.mapper'

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

    // Tx 1: Marcar compra y transacción como pagadas (siempre debe commitear)
    await this.prisma.$transaction(async (tx) => {
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
    })
    this.logger.log(`Compra ${purchaseId} marcada como PAID`)

    // Tx 2: Generar LuckyPasses (transacción separada)
    await this.prisma.$transaction(async (tx) => {

      // 3. Generar LuckyPasses para cada UserPack
      const userPacks = await tx.userPack.findMany({
        where: { purchaseId },
        include: { pack: true },
      })

      const raffleId = existing.raffleId
      if (!raffleId) {
        throw new BadRequestException('La compra no tiene rifa asociada')
      }

      let totalLuckyPasses = 0

      for (const userPack of userPacks) {
        const pack = userPack.pack
        if (!pack) continue

        const count = userPack.quantity * pack.luckyPassQuantity
        totalLuckyPasses += count

        const preferred: number[] = (userPack.selectedNumbers as number[] | null) ?? []

        // Lock the raffle row to serialize concurrent ticket assignments
        await tx.$queryRaw`
          SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
        `
        // Now safely compute the current max ticket number
        const maxResult = await tx.$queryRaw<[{ max_ticket: string | null }]>`
          SELECT MAX(ticket_number)::text AS max_ticket
          FROM public.lucky_passes
          WHERE raffle_id = ${raffleId}::uuid
        `
        const rawMax = maxResult[0]?.max_ticket
        this.logger.debug(`MAX ticket raw result: ${JSON.stringify(maxResult)}, rawMax=${rawMax}`)
        let nextTicket = (rawMax ? parseInt(rawMax, 10) : 0) + 1
        this.logger.debug(`nextTicket calculado: ${nextTicket}, preferred: ${JSON.stringify(preferred)}`)

        // Verificar que los números preferidos siguen disponibles
        if (preferred.length > 0) {
          const taken = await tx.luckyPass.findMany({
            where: {
              raffleId,
              ticketNumber: { in: preferred },
            },
            select: { ticketNumber: true },
          })
          if (taken.length > 0) {
            const takenNums = taken.map((lp) => lp.ticketNumber).join(', ')
            throw new ConflictException(
              `Los números ${takenNums} ya fueron tomados por otro usuario. Por favor elige otros.`,
            )
          }
        }

        // Crear LuckyPasses: usar preferred si existen, si no secuencial
        const luckyPassData: {
          raffleId: string
          userId: string | null
          userPackId: string
          ticketNumber: number
          status: 'active'
          isWinner: boolean
        }[] = []
        for (let i = 0; i < count; i++) {
          const ticketNumber = preferred[i] !== undefined ? preferred[i] : nextTicket++
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

        this.logger.debug(
          `Generados ${count} LuckyPasses para userPack ${userPack.id} (tickets ${nextTicket - count}-${nextTicket - 1})`,
        )
      }

      // 4. Actualizar raffle_progress
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

      // 5. Desbloquear milestones automáticamente según packsSold actualizado
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

    // Obtener la compra actualizada con la relación
    const purchaseWithRaffle = await this.purchasesRepository.findUnique(
      { id: purchaseId },
      { raffle: true },
    )

    if (!purchaseWithRaffle) {
      throw new NotFoundException('Error al recuperar la compra actualizada')
    }

    return mapPurchaseToDto(purchaseWithRaffle as PurchaseWithRaffle)
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
}
