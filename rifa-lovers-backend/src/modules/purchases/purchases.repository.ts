import { Injectable, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import { PaymentStatus, Prisma, Purchase, PurchaseStatus } from '@prisma/client'

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
    selectedNumbers?: number[]
    pack: { name: string | null; price: { toNumber(): number } | null; luckyPassQuantity: number }
  }): Promise<{ purchase: Purchase }> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Lock raffle row to serialize concurrent reservations
      await tx.$executeRaw`
        SELECT id FROM public.raffles WHERE id = ${data.raffleId}::uuid FOR UPDATE
      `

      // 2. If selectedNumbers provided, validate and reserve atomically
      if (data.selectedNumbers && data.selectedNumbers.length > 0) {
        // Check against lucky_passes (confirmed tickets)
        const takenPasses = await tx.$queryRaw<{ ticket_number: number }[]>`
          SELECT ticket_number FROM public.lucky_passes
          WHERE raffle_id = ${data.raffleId}::uuid
            AND ticket_number = ANY(${data.selectedNumbers}::int[])
        `

        // Check against active reservations
        const takenReservations = await tx.$queryRaw<{ ticket_number: number }[]>`
          SELECT ticket_number FROM public.ticket_reservations
          WHERE raffle_id = ${data.raffleId}::uuid
            AND ticket_number = ANY(${data.selectedNumbers}::int[])
            AND expires_at > NOW()
        `

        const takenNumbers = [
          ...takenPasses.map((r) => r.ticket_number),
          ...takenReservations.map((r) => r.ticket_number),
        ]

        if (takenNumbers.length > 0) {
          throw new ConflictException(
            `Los números ${takenNumbers.join(', ')} ya fueron reservados o tomados por otro usuario. Por favor elige otros números.`
          )
        }
      }

      // 3. Crear Purchase
      const purchase = await tx.purchase.create({
        data: {
          user: { connect: { id: data.userId } },
          raffle: { connect: { id: data.raffleId } },
          totalAmount: data.totalAmount,
          status: 'pending',
        },
      })

      // 4. Crear UserPack
      await tx.userPack.create({
        data: {
          user: { connect: { id: data.userId } },
          raffle: { connect: { id: data.raffleId } },
          pack: { connect: { id: data.packId } },
          purchase: { connect: { id: purchase.id } },
          quantity: data.quantity,
          totalPaid: data.totalAmount,
          selectedNumbers: data.selectedNumbers ?? [],
        },
      })

      // 5. Crear PaymentTransaction (inicialmente status: 'created')
      await tx.paymentTransaction.create({
        data: {
          purchase: { connect: { id: purchase.id } },
          provider: 'flow',
          amount: data.totalAmount,
          status: 'created',
        },
      })

      // 6. Insert ticket reservations (if any) - now guaranteed no conflicts
      if (data.selectedNumbers && data.selectedNumbers.length > 0) {
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
        for (const ticketNumber of data.selectedNumbers) {
          await tx.$executeRaw`
            INSERT INTO public.ticket_reservations (id, raffle_id, ticket_number, user_id, purchase_id, expires_at, created_at)
            VALUES (gen_random_uuid(), ${data.raffleId}::uuid, ${ticketNumber}, ${data.userId}::uuid, ${purchase.id}::uuid, ${expiresAt}, NOW())
          `
        }
      }

      return { purchase }
    })
  }

  async updatePaymentTransaction(
    purchaseId: string,
    data: {
      providerTransactionId?: string
      status?: PaymentStatus
    },
  ): Promise<void> {
    await this.prisma.paymentTransaction.updateMany({
      where: { purchaseId },
      data: {
        ...(data.providerTransactionId && { providerTransactionId: data.providerTransactionId }),
        ...(data.status && { status: data.status }),
      },
    })
  }
}
