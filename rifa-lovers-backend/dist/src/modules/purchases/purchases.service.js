"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const resend_service_1 = require("../email/resend.service");
const purchase_mapper_1 = require("./mappers/purchase.mapper");
const date_fns_1 = require("date-fns");
const locale_1 = require("date-fns/locale");
const crypto = __importStar(require("crypto"));
let PurchasesService = PurchasesService_1 = class PurchasesService {
    constructor(purchasesRepository, packsRepository, rafflesRepository, prisma, resendService) {
        this.purchasesRepository = purchasesRepository;
        this.packsRepository = packsRepository;
        this.rafflesRepository = rafflesRepository;
        this.prisma = prisma;
        this.resendService = resendService;
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
                    idempotencyKey: null,
                },
            });
            const userPacks = await tx.userPack.findMany({
                where: { purchaseId },
                include: { pack: true },
            });
            const raffleId = existing.raffleId;
            if (!raffleId) {
                throw new common_1.BadRequestException('La compra no tiene rifa asociada');
            }
            const reservedTickets = await tx.$queryRaw `
        SELECT ticket_number FROM public.ticket_reservations
        WHERE purchase_id = ${purchaseId}::uuid
      `;
            const reservedNumbers = reservedTickets.map((r) => r.ticket_number);
            this.logger.debug(`Tickets reservados para purchase=${purchaseId}: ${reservedNumbers.join(', ')}`);
            await tx.$queryRaw `
        SELECT id FROM public.raffles WHERE id = ${raffleId}::uuid FOR UPDATE
      `;
            const maxResult = await tx.$queryRaw `
        SELECT MAX(ticket_number)::text AS max_ticket
        FROM public.lucky_passes
        WHERE raffle_id = ${raffleId}::uuid
      `;
            const rawMax = maxResult[0]?.max_ticket;
            let nextTicket = (rawMax ? parseInt(rawMax, 10) : 0) + 1;
            let totalLuckyPasses = 0;
            let reservedNumbersIdx = 0;
            for (const userPack of userPacks) {
                const pack = userPack.pack;
                if (!pack)
                    continue;
                const count = userPack.quantity * pack.luckyPassQuantity;
                totalLuckyPasses += count;
                const luckyPassData = [];
                for (let i = 0; i < count; i++) {
                    let ticketNumber;
                    if (reservedNumbersIdx < reservedNumbers.length) {
                        ticketNumber = reservedNumbers[reservedNumbersIdx++];
                    }
                    else {
                        ticketNumber = nextTicket++;
                    }
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
                this.logger.debug(`Generados ${count} LuckyPasses para userPack ${userPack.id}`);
            }
            if (reservedNumbers.length > 0) {
                await tx.$executeRaw `
          DELETE FROM public.ticket_reservations WHERE purchase_id = ${purchaseId}::uuid
        `;
                this.logger.debug(`Reservas liberadas para purchase=${purchaseId}`);
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
        });
        if (!purchaseWithDetails) {
            throw new common_1.NotFoundException('Error al recuperar la compra actualizada');
        }
        if (purchaseWithDetails.user?.email) {
            const userName = purchaseWithDetails.user.firstName
                ? `${purchaseWithDetails.user.firstName} ${purchaseWithDetails.user.lastName || ''}`.trim()
                : 'Comprador';
            const ticketNumbers = purchaseWithDetails.userPacks.flatMap((up) => up.luckyPasses.map((lp) => lp.ticketNumber).filter((n) => n !== null));
            const pack = purchaseWithDetails.userPacks[0]?.pack;
            const packName = pack?.name || 'Pack';
            const quantity = purchaseWithDetails.userPacks.reduce((sum, up) => sum + up.quantity, 0);
            const luckyPassCount = ticketNumbers.length;
            const totalAmount = purchaseWithDetails.totalAmount?.toNumber() ?? 0;
            const raffleName = purchaseWithDetails.raffle?.title || 'Rifa';
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
                this.logger.error(`Error enviando email de compra: ${err}`);
            });
        }
        return (0, purchase_mapper_1.mapPurchaseToDto)(purchaseWithDetails);
    }
    async findByProviderTransactionId(providerTransactionId) {
        const paymentTx = await this.prisma.paymentTransaction.findFirst({
            where: { providerTransactionId },
            include: { purchase: true },
        });
        return paymentTx?.purchase ?? null;
    }
    async createFreePurchase(userId, createDto) {
        this.logger.debug(`Creando compra gratuita: userId=${userId}, raffleId=${createDto.raffleId}, packId=${createDto.packId}`);
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
        if (pack.name?.toUpperCase() !== 'EXCLUSIVO PREVENTA') {
            throw new common_1.BadRequestException('Este endpoint solo acepta el pack Exclusivo Preventa');
        }
        if (raffle.title?.toUpperCase() !== 'RIFA PREVENTA') {
            throw new common_1.BadRequestException('Este endpoint solo acepta la Rifa Preventa');
        }
        const existingPurchase = await this.prisma.purchase.findFirst({
            where: {
                userId,
                raffleId: createDto.raffleId,
                userPacks: {
                    some: {
                        packId: createDto.packId,
                    },
                },
            },
        });
        if (existingPurchase) {
            throw new common_1.BadRequestException('Ya tienes este pack preventa. Solo puedes obtenerlo una vez.');
        }
        const unitPrice = pack.price?.toNumber() ?? 0;
        const totalAmount = unitPrice * createDto.quantity;
        if (totalAmount !== 0) {
            throw new common_1.BadRequestException('El pack preventa debe tener valor $0');
        }
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
            const providerTransactionId = `RIFALOVERS-${crypto.randomUUID()}`;
            await this.prisma.paymentTransaction.create({
                data: {
                    purchaseId: result.purchase.id,
                    provider: 'Rifalovers',
                    providerTransactionId,
                    amount: 0,
                    status: 'approved',
                },
            });
            await this.prisma.purchase.update({
                where: { id: result.purchase.id },
                data: { status: 'paid', paidAt: new Date() },
            });
            await this.confirmPayment(result.purchase.id, {
                providerTransactionId,
                provider: 'Rifalovers',
                status: 'approved',
            });
            this.logger.log(`Compra gratuita creada exitosamente: ${result.purchase.id}`);
            return {
                id: result.purchase.id,
                raffleId: raffle.id,
                raffleName: raffle.title || 'Rifa sin nombre',
                totalAmount: 0,
                status: 'paid',
                createdAt: result.purchase.createdAt.toISOString(),
                flowOrderId: undefined,
                paymentUrl: undefined,
                packName: pack.name || 'Pack sin nombre',
                quantity: createDto.quantity,
                unitPrice: 0,
                luckyPassCount: createDto.quantity * (pack.luckyPassQuantity ?? 1),
            };
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            const stack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error creando compra gratuita: ${msg}`, stack);
            throw error;
        }
    }
    async getRecentPurchases() {
        this.logger.debug('Obteniendo compras recientes para ticker');
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
        });
        return purchases
            .map((purchase) => {
            const firstName = purchase.user?.firstName ?? 'Usuario';
            const lastName = purchase.user?.lastName ?? '';
            const lastNameInitial = lastName.charAt(0);
            const name = lastNameInitial ? `${firstName} ${lastNameInitial}.` : firstName;
            const ticketCount = purchase.userPacks.reduce((sum, userPack) => sum + userPack.luckyPasses.length, 0);
            const timeAgo = purchase.paidAt
                ? (0, date_fns_1.formatDistanceToNow)(new Date(purchase.paidAt), {
                    addSuffix: true,
                    locale: locale_1.es,
                })
                : 'hace un momento';
            return {
                id: purchase.id,
                name,
                action: 'compró',
                ticketCount,
                timeAgo,
                city: 'Santiago',
            };
        })
            .filter((purchase) => purchase.ticketCount > 0);
    }
};
exports.PurchasesService = PurchasesService;
exports.PurchasesService = PurchasesService = PurchasesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [purchases_repository_1.PurchasesRepository,
        packs_repository_1.PacksRepository,
        raffles_repository_1.RafflesRepository,
        prisma_service_1.PrismaService,
        resend_service_1.ResendService])
], PurchasesService);
//# sourceMappingURL=purchases.service.js.map