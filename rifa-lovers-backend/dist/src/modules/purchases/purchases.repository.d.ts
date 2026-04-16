import { PrismaService } from '../../database/prisma.service';
import { PaymentStatus, Prisma, Purchase, PurchaseStatus } from '@prisma/client';
export declare class PurchasesRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findUnique(where: Prisma.PurchaseWhereUniqueInput, include?: Prisma.PurchaseInclude): Promise<Purchase | null>;
    findFirst(where: Prisma.PurchaseWhereInput, include?: Prisma.PurchaseInclude, orderBy?: Prisma.PurchaseOrderByWithRelationInput): Promise<Purchase | null>;
    findMany(where?: Prisma.PurchaseWhereInput, include?: Prisma.PurchaseInclude, orderBy?: Prisma.PurchaseOrderByWithRelationInput, skip?: number, take?: number): Promise<Purchase[]>;
    create(data: Prisma.PurchaseCreateInput): Promise<Purchase>;
    update(where: Prisma.PurchaseWhereUniqueInput, data: Prisma.PurchaseUpdateInput): Promise<Purchase>;
    delete(where: Prisma.PurchaseWhereUniqueInput): Promise<Purchase>;
    count(where?: Prisma.PurchaseWhereInput): Promise<number>;
    findByUser(userId: string, include?: Prisma.PurchaseInclude): Promise<Purchase[]>;
    findByRaffle(raffleId: string, include?: Prisma.PurchaseInclude): Promise<Purchase[]>;
    updateStatus(id: string, status: PurchaseStatus, paidAt?: Date): Promise<Purchase>;
    findByStatus(status: PurchaseStatus, include?: Prisma.PurchaseInclude): Promise<Purchase[]>;
    findPendingOlderThan(minutes: number): Promise<Purchase[]>;
    createWithUserPacks(purchaseData: Prisma.PurchaseCreateInput, userPacksData: Prisma.UserPackCreateManyPurchaseInput[]): Promise<Purchase>;
    getTotalRevenueByRaffle(raffleId: string): Promise<number>;
    createFullPurchase(data: {
        userId: string;
        raffleId: string;
        packId: string;
        quantity: number;
        totalAmount: number;
        selectedNumbers?: number[];
        pack: {
            name: string | null;
            price: {
                toNumber(): number;
            } | null;
            luckyPassQuantity: number;
        };
    }): Promise<{
        purchase: Purchase;
    }>;
    updatePaymentTransaction(purchaseId: string, data: {
        providerTransactionId?: string;
        status?: PaymentStatus;
    }): Promise<void>;
}
