import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PurchasesRepository } from './purchases.repository'
import { PacksRepository } from '../packs/packs.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { CreatePurchaseDto, PurchaseResponseDto, CreatePurchaseResponseDto } from './dto'
import { PurchaseEntity } from './entities'
import { Purchase, Raffle, Pack } from '@prisma/client'

// Tipo que incluye la relación raffle
type PurchaseWithRaffle = Purchase & { raffle: Raffle | null }

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name)

  constructor(
    private readonly purchasesRepository: PurchasesRepository,
    private readonly packsRepository: PacksRepository,
    private readonly rafflesRepository: RafflesRepository,
  ) {}

  async findByUser(userId: string): Promise<PurchaseResponseDto[]> {
    this.logger.debug(`Buscando compras del usuario: ${userId}`)

    const purchases = await this.purchasesRepository.findByUser(userId, {
      raffle: true,
    })

    this.logger.debug(`Encontradas ${purchases.length} compras para el usuario ${userId}`)

    return purchases.map((purchase) => this.mapToResponseDto(purchase as PurchaseWithRaffle))
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
        selectedNumber: createDto.selectedNumber,
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
      }
    } catch (error) {
      this.logger.error(`Error creando compra: ${error.message}`, error.stack)
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

    return this.mapToResponseDto(purchase as PurchaseWithRaffle)
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

    return this.mapToResponseDto(purchaseWithRaffle as PurchaseWithRaffle)
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

    // 1. Actualizar el estado de la compra a 'paid'
    const purchase = await this.purchasesRepository.updateStatus(
      purchaseId,
      'paid',
      new Date(),
    )

    // 2. Actualizar el PaymentTransaction con los datos del pago
    await this.purchasesRepository.updatePaymentTransaction(
      purchaseId,
      {
        providerTransactionId: paymentData.providerTransactionId,
        status: 'approved',
        paidAt: new Date(),
      },
    )

    // 3. TODO: Generar LuckyPasses (esto se implementará completamente en Fase 8)
    // Por ahora, solo marcamos la compra como pagada

    this.logger.log(`✅ Pago confirmado para compra: ${purchaseId}`)

    // Obtener la compra actualizada con la relación
    const purchaseWithRaffle = await this.purchasesRepository.findUnique(
      { id: purchase.id },
      { raffle: true },
    )

    if (!purchaseWithRaffle) {
      throw new NotFoundException('Error al recuperar la compra actualizada')
    }

    return this.mapToResponseDto(purchaseWithRaffle as PurchaseWithRaffle)
  }

  private mapToResponseDto(purchase: PurchaseWithRaffle): PurchaseResponseDto {
    return {
      id: purchase.id,
      raffleId: purchase.raffleId || '',
      raffleName: purchase.raffle?.title || 'Rifa sin nombre',
      totalAmount: purchase.totalAmount?.toNumber() || 0,
      status: purchase.status,
      createdAt: purchase.createdAt.toISOString(),
    }
  }
}
