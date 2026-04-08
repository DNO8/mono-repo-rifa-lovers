import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PurchasesRepository } from './purchases.repository'
import { CreatePurchaseDto, PurchaseResponseDto } from './dto'
import { PurchaseEntity } from './entities'
import { Purchase, Raffle } from '@prisma/client'

// Tipo que incluye la relación raffle
type PurchaseWithRaffle = Purchase & { raffle: Raffle | null }

@Injectable()
export class PurchasesService {
  private readonly logger = new Logger(PurchasesService.name)

  constructor(private readonly purchasesRepository: PurchasesRepository) {}

  async findByUser(userId: string): Promise<PurchaseResponseDto[]> {
    this.logger.debug(`Buscando compras del usuario: ${userId}`)

    const purchases = await this.purchasesRepository.findByUser(userId, {
      raffle: true,
    })

    this.logger.debug(`Encontradas ${purchases.length} compras para el usuario ${userId}`)

    return purchases.map((purchase) => this.mapToResponseDto(purchase as PurchaseWithRaffle))
  }

  async create(userId: string, createDto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    this.logger.debug(`Creando compra para usuario: ${userId}, rifa: ${createDto.raffleId}`)

    // Validar que los datos necesarios están presentes
    if (!createDto.raffleId) {
      throw new BadRequestException('El ID de la rifa es requerido')
    }

    try {
      // Crear la compra usando el repository
      const purchase = await this.purchasesRepository.create({
        raffle: { connect: { id: createDto.raffleId } },
        totalAmount: createDto.totalAmount,
        status: 'pending', // Inicia como pending, se marca paid al confirmar pago
        userPacks: undefined,
        paymentTransactions: undefined,
      })

      // Si hay userId, conectar el usuario
      if (userId) {
        await this.purchasesRepository.update(
          { id: purchase.id },
          {
            user: { connect: { id: userId } },
          },
        )
      }

      this.logger.log(`Compra creada exitosamente: ${purchase.id}`)

      // Obtener la compra con la relación raffle incluida
      const purchaseWithRaffle = await this.purchasesRepository.findUnique(
        { id: purchase.id },
        { raffle: true },
      )

      if (!purchaseWithRaffle) {
        throw new NotFoundException('Error al recuperar la compra recién creada')
      }

      return this.mapToResponseDto(purchaseWithRaffle as PurchaseWithRaffle)
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
