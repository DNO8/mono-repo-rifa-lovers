import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { CreatePurchaseDto, PurchaseResponseDto } from './dto'

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(userId: string): Promise<PurchaseResponseDto[]> {
    const purchases = await this.prisma.purchase.findMany({
      where: { userId: userId },
      include: {
        raffle: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return purchases.map((purchase) => ({
      id: purchase.id,
      raffleId: purchase.raffleId || '',
      raffleName: purchase.raffle?.title || 'Rifa sin nombre',
      totalAmount: purchase.totalAmount?.toNumber() || 0,
      status: purchase.status,
      createdAt: purchase.createdAt.toISOString(),
    }))
  }

  async create(userId: string, createDto: CreatePurchaseDto): Promise<PurchaseResponseDto> {
    const purchase = await this.prisma.purchase.create({
      data: {
        userId: userId,
        raffleId: createDto.raffleId,
        totalAmount: createDto.totalAmount,
        status: 'paid',
      },
      include: {
        raffle: true,
      },
    })

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
