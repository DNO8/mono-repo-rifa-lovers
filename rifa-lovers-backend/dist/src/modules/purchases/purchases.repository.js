"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let PurchasesRepository = class PurchasesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUnique(where, include) {
        return this.prisma.purchase.findUnique({ where, include });
    }
    async findFirst(where, include, orderBy) {
        return this.prisma.purchase.findFirst({ where, include, orderBy });
    }
    async findMany(where, include, orderBy, skip, take) {
        return this.prisma.purchase.findMany({ where, include, orderBy, skip, take });
    }
    async create(data) {
        return this.prisma.purchase.create({ data });
    }
    async update(where, data) {
        return this.prisma.purchase.update({ where, data });
    }
    async delete(where) {
        return this.prisma.purchase.delete({ where });
    }
    async count(where) {
        return this.prisma.purchase.count({ where });
    }
    async findByUser(userId, include) {
        return this.prisma.purchase.findMany({
            where: { userId },
            include,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByRaffle(raffleId, include) {
        return this.prisma.purchase.findMany({
            where: { raffleId },
            include,
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status, paidAt) {
        const data = { status };
        if (paidAt) {
            data.paidAt = paidAt;
        }
        return this.prisma.purchase.update({
            where: { id },
            data,
        });
    }
    async findByStatus(status, include) {
        return this.prisma.purchase.findMany({
            where: { status },
            include,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findPendingOlderThan(minutes) {
        const cutoffDate = new Date(Date.now() - minutes * 60 * 1000);
        return this.prisma.purchase.findMany({
            where: {
                status: 'pending',
                createdAt: { lt: cutoffDate },
            },
        });
    }
    async createWithUserPacks(purchaseData, userPacksData) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.create({
                data: purchaseData,
            });
            if (userPacksData && userPacksData.length > 0) {
                await tx.userPack.createMany({
                    data: userPacksData.map((pack) => ({
                        ...pack,
                        purchaseId: purchase.id,
                    })),
                });
            }
            return purchase;
        });
    }
    async getTotalRevenueByRaffle(raffleId) {
        const result = await this.prisma.purchase.aggregate({
            where: {
                raffleId,
                status: 'paid',
            },
            _sum: {
                totalAmount: true,
            },
        });
        return result._sum.totalAmount?.toNumber() || 0;
    }
    async createFullPurchase(data) {
        return this.prisma.$transaction(async (tx) => {
            const purchase = await tx.purchase.create({
                data: {
                    user: { connect: { id: data.userId } },
                    raffle: { connect: { id: data.raffleId } },
                    totalAmount: data.totalAmount,
                    status: 'pending',
                },
            });
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
            });
            await tx.paymentTransaction.create({
                data: {
                    purchase: { connect: { id: purchase.id } },
                    provider: 'flow',
                    amount: data.totalAmount,
                    status: 'created',
                },
            });
            return { purchase };
        });
    }
    async updatePaymentTransaction(purchaseId, data) {
        await this.prisma.paymentTransaction.updateMany({
            where: { purchaseId },
            data: {
                ...(data.providerTransactionId && { providerTransactionId: data.providerTransactionId }),
                ...(data.status && { status: data.status }),
            },
        });
    }
};
exports.PurchasesRepository = PurchasesRepository;
exports.PurchasesRepository = PurchasesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PurchasesRepository);
//# sourceMappingURL=purchases.repository.js.map