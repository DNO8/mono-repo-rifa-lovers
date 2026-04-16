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
var PurchasesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasesService = void 0;
const common_1 = require("@nestjs/common");
const purchases_repository_1 = require("./purchases.repository");
const packs_repository_1 = require("../packs/packs.repository");
const raffles_repository_1 = require("../raffles/raffles.repository");
const prisma_service_1 = require("../../database/prisma.service");
const purchase_mapper_1 = require("./mappers/purchase.mapper");
let PurchasesService = PurchasesService_1 = class PurchasesService {
    constructor(purchasesRepository, packsRepository, rafflesRepository, prisma) {
        this.purchasesRepository = purchasesRepository;
        this.packsRepository = packsRepository;
        this.rafflesRepository = rafflesRepository;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PurchasesService_1.name);
    }
    async findByUser(userId) {
        this.logger.debug(`Buscando compras del usuario: ${userId}`);
        const purchases = await this.purchasesRepository.findByUser(userId, {
            raffle: true,
            userPacks: { include: { pack: true } },
        });
        this.logger.debug(`Encontradas ${purchases.length} compras para el usuario ${userId}`);
        return purchases.map((purchase) => (0, purchase_mapper_1.mapPurchaseToDto)(purchase));
    }
    async create(userId, createDto) {
        this.logger.debug(`Creando compra: userId=${userId}, raffleId=${createDto.raffleId}, packId=${createDto.packId}, qty=${createDto.quantity}`);
        if (!createDto.raffleId) {
            throw new common_1.BadRequestException('El ID de la rifa es requerido');
        }
        if (!createDto.packId) {
            throw new common_1.BadRequestException('El ID del pack es requerido');
        }
        if (!createDto.quantity || createDto.quantity < 1) {
            throw new common_1.BadRequestException('La cantidad debe ser al menos 1');
        }
        const raffle = await this.rafflesRepository.findUnique({ id: createDto.raffleId });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        if (raffle.status !== 'active') {
            throw new common_1.BadRequestException(`La rifa no está activa (estado: ${raffle.status})`);
        }
        const pack = await this.packsRepository.findUnique({ id: createDto.packId });
        if (!pack) {
            throw new common_1.NotFoundException('Pack no encontrado');
        }
        if (!pack.price) {
            throw new common_1.BadRequestException('El pack no tiene precio definido');
        }
        const unitPrice = pack.price.toNumber();
        const totalAmount = unitPrice * createDto.quantity;
        try {
            const result = await this.purchasesRepository.createFullPurchase({
                userId,
                raffleId: createDto.raffleId,
                packId: createDto.packId,
                quantity: createDto.quantity,
                totalAmount,
                selectedNumbers: createDto.selectedNumbers,
                pack,
            });
            this.logger.log(`Compra creada exitosamente: ${result.purchase.id}`);
            return {
                id: result.purchase.id,
                raffleId: raffle.id,
                raffleName: raffle.title || 'Rifa sin nombre',
                totalAmount,
                status: 'pending',
                createdAt: result.purchase.createdAt.toISOString(),
                flowOrderId: undefined,
                paymentUrl: undefined,
                packName: pack.name || 'Pack sin nombre',
                quantity: createDto.quantity,
                unitPrice,
                luckyPassCount: createDto.quantity * (pack.luckyPassQuantity ?? 1),
            };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error creando compra: ${msg}`, stack);
            throw error;
        }
    }
    async findById(id) {
        this.logger.debug(`Buscando compra por ID: ${id}`);
        const purchase = await this.purchasesRepository.findUnique({ id }, { raffle: true });
        if (!purchase) {
            this.logger.warn(`Compra no encontrada: ${id}`);
            throw new common_1.NotFoundException(`Compra con ID ${id} no encontrada`);
        }
        return (0, purchase_mapper_1.mapPurchaseToDto)(purchase);
    }
    async updateStatus(id, status) {
        this.logger.debug(`Actualizando estado de compra ${id} a: ${status}`);
        const purchase = await this.purchasesRepository.updateStatus(id, status, status === 'paid' ? new Date() : undefined);
        this.logger.log(`Estado de compra ${id} actualizado a: ${status}`);
        const purchaseWithRaffle = await this.purchasesRepository.findUnique({ id: purchase.id }, { raffle: true });
        if (!purchaseWithRaffle) {
            throw new common_1.NotFoundException('Error al recuperar la compra actualizada');
        }
        return (0, purchase_mapper_1.mapPurchaseToDto)(purchaseWithRaffle);
    }
    async confirmPayment(purchaseId, paymentData) {
        this.logger.debug(`Confirmando pago para compra: ${purchaseId}`);
        const existing = await this.purchasesRepository.findUnique({ id: purchaseId }, { raffle: true, userPacks: { include: { pack: true } } });
        if (!existing) {
            throw new common_1.NotFoundException(`Compra ${purchaseId} no encontrada`);
        }
        if (existing.status === 'paid') {
            this.logger.warn(`Compra ${purchaseId} ya fue confirmada, ignorando duplicado`);
            return (0, purchase_mapper_1.mapPurchaseToDto)(existing);
        }
        await this.prisma.$transaction(async (tx) => {
            await tx.purchase.update({
                where: { id: purchaseId },
                data: { status: 'paid', paidAt: new Date() },
            });
            await tx.paymentTransaction.updateMany({
                where: { purchaseId, status: { not: 'approved' } },
                data: {
                    providerTransactionId: paymentData.providerTransactionId,
                    status: 'approved',
                },
            });
        });
        this.logger.log(`Compra ${purchaseId} marcada como PAID`);
        await this.prisma.$transaction(async (tx) => {
            const userPacks = await tx.userPack.findMany({
                where: { purchaseId },
                include: { pack: true },
            });
            const raffleId = existing.raffleId;
            if (!raffleId) {
                throw new common_1.BadRequestException('La compra no tiene rifa asociada');
            }
            let totalLuckyPasses = 0;
            for (const userPack of userPacks) {
                const pack = userPack.pack;
                if (!pack)
                    continue;
                const count = userPack.quantity * pack.luckyPassQuantity;
                totalLuckyPasses += count;
                const preferred = userPack.selectedNumbers ?? [];
                await tx.$queryRaw `
          SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
        `;
                const maxResult = await tx.$queryRaw `
          SELECT MAX(ticket_number)::text AS max_ticket
          FROM public.lucky_passes
          WHERE raffle_id = ${raffleId}::uuid
        `;
                const rawMax = maxResult[0]?.max_ticket;
                this.logger.debug(`MAX ticket raw result: ${JSON.stringify(maxResult)}, rawMax=${rawMax}`);
                let nextTicket = (rawMax ? parseInt(rawMax, 10) : 0) + 1;
                this.logger.debug(`nextTicket calculado: ${nextTicket}, preferred: ${JSON.stringify(preferred)}`);
                if (preferred.length > 0) {
                    const taken = await tx.luckyPass.findMany({
                        where: {
                            raffleId,
                            ticketNumber: { in: preferred },
                        },
                        select: { ticketNumber: true },
                    });
                    if (taken.length > 0) {
                        const takenNums = taken.map((lp) => lp.ticketNumber).join(', ');
                        throw new common_1.ConflictException(`Los números ${takenNums} ya fueron tomados por otro usuario. Por favor elige otros.`);
                    }
                }
                const luckyPassData = [];
                for (let i = 0; i < count; i++) {
                    const ticketNumber = preferred[i] !== undefined ? preferred[i] : nextTicket++;
                    if (!ticketNumber || isNaN(ticketNumber) || ticketNumber < 1) {
                        throw new common_1.BadRequestException(`Número de ticket inválido generado: ${ticketNumber}`);
                    }
                    luckyPassData.push({
                        raffleId,
                        userId: existing.userId,
                        userPackId: userPack.id,
                        ticketNumber,
                        status: 'active',
                        isWinner: false,
                    });
                }
                await tx.luckyPass.createMany({ data: luckyPassData });
                this.logger.debug(`Generados ${count} LuckyPasses para userPack ${userPack.id} (tickets ${nextTicket - count}-${nextTicket - 1})`);
            }
            const raffle = await tx.raffle.findUnique({ where: { id: raffleId } });
            const totalQuantity = userPacks.reduce((sum, up) => sum + up.quantity, 0);
            const totalAmount = existing.totalAmount?.toNumber() ?? 0;
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
            });
            if (raffle) {
                const updatedProgress = await tx.raffleProgress.findUnique({
                    where: { raffleId },
                });
                if (updatedProgress) {
                    const pctGoal = (updatedProgress.packsSold / raffle.goalPacks) * 100;
                    await tx.raffleProgress.update({
                        where: { raffleId },
                        data: { percentageToGoal: pctGoal },
                    });
                }
            }
            if (raffle) {
                const updatedProgress = await tx.raffleProgress.findUnique({ where: { raffleId } });
                if (updatedProgress) {
                    await tx.milestone.updateMany({
                        where: {
                            raffleId,
                            isUnlocked: false,
                            requiredPacks: { lte: updatedProgress.packsSold },
                        },
                        data: { isUnlocked: true },
                    });
                }
            }
            this.logger.log(`Pago confirmado: purchase=${purchaseId}, luckyPasses=${totalLuckyPasses}, packsSold=${totalQuantity}`);
        });
        const purchaseWithRaffle = await this.purchasesRepository.findUnique({ id: purchaseId }, { raffle: true });
        if (!purchaseWithRaffle) {
            throw new common_1.NotFoundException('Error al recuperar la compra actualizada');
        }
        return (0, purchase_mapper_1.mapPurchaseToDto)(purchaseWithRaffle);
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = PurchasesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [purchases_repository_1.PurchasesRepository,
        packs_repository_1.PacksRepository,
        raffles_repository_1.RafflesRepository,
        prisma_service_1.PrismaService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map