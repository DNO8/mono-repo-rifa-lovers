import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { Prisma, Purchase, PurchaseStatus } from '@prisma/client'

@Injectable()
export class PurchasesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.PurchaseWhereUniqueInput,
    include?: Prisma.PurchaseInclude,
  ): Promise<Purchase | null> {
    return this.prisma.purchase.findUnique({ where, include })
  }

  async findFirst(
    where: Prisma.PurchaseWhereInput,
    include?: Prisma.PurchaseInclude,
    orderBy?: Prisma.PurchaseOrderByWithRelationInput,
  ): Promise<Purchase | null> {
    return this.prisma.purchase.findFirst({ where, include, orderBy })
  }

  async findMany(
    where?: Prisma.PurchaseWhereInput,
    include?: Prisma.PurchaseInclude,
    orderBy?: Prisma.PurchaseOrderByWithRelationInput,
    skip?: number,
    take?: number,
  ): Promise<Purchase[]> {
    return this.prisma.purchase.findMany({ where, include, orderBy, skip, take })
  }

  async create(data: Prisma.PurchaseCreateInput): Promise<Purchase> {
    return this.prisma.purchase.create({ data })
  }

  async update(
    where: Prisma.PurchaseWhereUniqueInput,
    data: Prisma.PurchaseUpdateInput,
  ): Promise<Purchase> {
    return this.prisma.purchase.update({ where, data })
  }

  async delete(where: Prisma.PurchaseWhereUniqueInput): Promise<Purchase> {
    return this.prisma.purchase.delete({ where })
  }

  async count(where?: Prisma.PurchaseWhereInput): Promise<number> {
    return this.prisma.purchase.count({ where })
  }

  async findByUser(userId: string, include?: Prisma.PurchaseInclude): Promise<Purchase[]> {
    return this.prisma.purchase.findMany({
      where: { userId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findByRaffle(raffleId: string, include?: Prisma.PurchaseInclude): Promise<Purchase[]> {
    return this.prisma.purchase.findMany({
      where: { raffleId },
      include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async updateStatus(
    id: string,
    status: PurchaseStatus,
    paidAt?: Date,
  ): Promise<Purchase> {
    const data: Prisma.PurchaseUpdateInput = { status }
    if (paidAt) {
      data.paidAt = paidAt
    }
    return this.prisma.purchase.update({
      where: { id },
      data,
    })
  }

  async findByStatus(status: PurchaseStatus, include?: Prisma.PurchaseInclude): Promise<Purchase[]> {
    return this.prisma.purchase.findMany({
      where: { status },
      include,
      orderBy: { createdAt: 'desc' },
    })
  }

  async findPendingOlderThan(minutes: number): Promise<Purchase[]> {
    const cutoffDate = new Date(Date.now() - minutes * 60 * 1000)
    return this.prisma.purchase.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: cutoffDate },
      },
    })
  }

  async createWithUserPacks(
    purchaseData: Prisma.PurchaseCreateInput,
    userPacksData: Prisma.UserPackCreateManyPurchaseInput[],
  ): Promise<Purchase> {
    return this.prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: purchaseData,
      })

      if (userPacksData && userPacksData.length > 0) {
        await tx.userPack.createMany({
          data: userPacksData.map((pack) => ({
            ...pack,
            purchaseId: purchase.id,
          })),
        })
      }

      return purchase
    })
  }

  async getTotalRevenueByRaffle(raffleId: string): Promise<number> {
    const result = await this.prisma.purchase.aggregate({
      where: {
        raffleId,
        status: 'paid',
      },
      _sum: {
        totalAmount: true,
      },
    })
    return result._sum.totalAmount?.toNumber() || 0
  }

  async createFullPurchase(data: {
    userId: string
    raffleId: string
    packId: string
    quantity: number
    totalAmount: number
    selectedNumber?: number
    pack: { name: string | null; price: { toNumber(): number } | null; luckyPassQuantity: number }
  }): Promise<{ purchase: Purchase }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Crear Purchase
      const purchase = await tx.purchase.create({
        data: {
          user: { connect: { id: data.userId } },
          raffle: { connect: { id: data.raffleId } },
          totalAmount: data.totalAmount,
          status: 'pending',
        },
      })

      // 2. Crear UserPack
      await tx.userPack.create({
        data: {
          user: { connect: { id: data.userId } },
          raffle: { connect: { id: data.raffleId } },
          pack: { connect: { id: data.packId } },
          purchase: { connect: { id: purchase.id } },
          quantity: data.quantity,
          totalPaid: data.totalAmount,
        },
      })

      // 3. Crear PaymentTransaction (inicialmente status: 'created')
      await tx.paymentTransaction.create({
        data: {
          purchase: { connect: { id: purchase.id } },
          provider: 'flow',
          amount: data.totalAmount,
          status: 'created',
        },
      })

      return { purchase }
    })
  }

  async updatePaymentTransaction(
    purchaseId: string,
    data: {
      providerTransactionId?: string
      status?: string
      paidAt?: Date
    },
  ): Promise<void> {
    await this.prisma.paymentTransaction.updateMany({
      where: { purchaseId },
      data: {
        ...(data.providerTransactionId && { providerTransactionId: data.providerTransactionId }),
        ...(data.status && { status: data.status as any }),
        ...(data.paidAt && { updatedAt: data.paidAt }), // Usamos updatedAt para registrar cuando se pagó
      },
    })
  }
}
