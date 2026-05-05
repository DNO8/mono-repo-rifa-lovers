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
var DrawService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../database/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let DrawService = DrawService_1 = class DrawService {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
        this.logger = new common_1.Logger(DrawService_1.name);
    }
    buildUserFullName(user) {
        if (!user)
            return null;
        const { firstName, lastName } = user;
        if (firstName && lastName)
            return `${firstName} ${lastName}`;
        return firstName || lastName || null;
    }
    async executeDraw(raffleId, adminUserId, prizeId) {
        this.logger.log(`Ejecutando sorteo para rifa ${raffleId} por admin ${adminUserId}${prizeId ? ` para premio ${prizeId}` : ''}`);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        if (raffle.status !== 'closed') {
            throw new common_1.BadRequestException(`La rifa debe estar cerrada para ejecutar el sorteo (estado actual: ${raffle.status})`);
        }
        const allPrizes = await this.prisma.prize.findMany({
            where: { raffleId: raffleId },
            include: {
                milestone: true,
                prizeWinners: true
            },
            orderBy: { milestone: { sortOrder: 'asc' } }
        });
        this.logger.log(`[DEBUG] Total premios en rifa: ${allPrizes.length}`);
        allPrizes.forEach((p, idx) => {
            this.logger.log(`[DEBUG] Premio ${idx + 1}: id=${p.id}, name=${p.name}, milestoneUnlocked=${p.milestone?.isUnlocked}, winnersCount=${p.prizeWinners?.length || 0}`);
        });
        let prizeToDraw = null;
        if (prizeId) {
            prizeToDraw = await this.prisma.prize.findFirst({
                where: {
                    id: prizeId,
                    raffleId: raffleId,
                    milestone: { isUnlocked: true },
                },
                include: { milestone: true },
            });
            if (!prizeToDraw) {
                throw new common_1.BadRequestException('El premio especificado no existe o no está desbloqueado');
            }
        }
        else {
            const prizes = await this.prisma.prize.findMany({
                where: {
                    raffleId: raffleId,
                    milestone: { isUnlocked: true },
                    prizeWinners: { none: {} },
                },
                include: { milestone: true },
                orderBy: { milestone: { sortOrder: 'asc' } },
                take: 1,
            });
            if (prizes.length === 0) {
                throw new common_1.BadRequestException('No hay premios pendientes para sortear');
            }
            prizeToDraw = prizes[0];
        }
        const existingWinner = await this.prisma.prizeWinner.findFirst({
            where: { prizeId: prizeToDraw.id },
        });
        if (existingWinner) {
            throw new common_1.BadRequestException('Este premio ya tiene un ganador asignado');
        }
        this.logger.log(`Sorteando premio: ${prizeToDraw.name}`);
        const usedPassIdsRaw = await this.prisma.prizeWinner.findMany({
            where: {
                prize: { raffleId: raffleId },
            },
            select: { luckyPassId: true },
        });
        const usedPassIds = new Set(usedPassIdsRaw.map(w => w.luckyPassId).filter((id) => id !== null));
        const activePasses = await this.prisma.luckyPass.findMany({
            where: {
                raffleId: raffleId,
                status: 'active',
                id: { notIn: Array.from(usedPassIds) },
            },
            include: { user: true },
        });
        if (activePasses.length === 0) {
            throw new common_1.BadRequestException('No hay LuckyPasses activos disponibles para el sorteo');
        }
        this.logger.log(`${activePasses.length} LuckyPasses activos participando`);
        const { winner, isComplete } = await this.prisma.$transaction(async (tx) => {
            const winnerIndex = (0, crypto_1.randomInt)(0, activePasses.length);
            const winnerPassId = activePasses[winnerIndex].id;
            const winnerPassWithUser = await tx.luckyPass.findUnique({
                where: { id: winnerPassId },
                include: { user: true }
            });
            if (!winnerPassWithUser) {
                throw new Error('LuckyPass no encontrado');
            }
            const winnerPass = winnerPassWithUser;
            await tx.prizeWinner.create({
                data: {
                    prizeId: prizeToDraw.id,
                    luckyPassId: winnerPass.id,
                    userId: winnerPass.userId,
                },
            });
            await tx.luckyPass.update({
                where: { id: winnerPass.id },
                data: {
                    status: 'winner',
                    isWinner: true,
                },
            });
            const userFullName = this.buildUserFullName(winnerPass.user);
            this.logger.log(`Ganador asignado: Prize=${prizeToDraw.name}, Pass=${winnerPass.ticketNumber}, User=${winnerPass.user?.email ?? 'N/A'}`);
            const pendingPrizes = await tx.prize.count({
                where: {
                    raffleId: raffleId,
                    milestone: { isUnlocked: true },
                    prizeWinners: { none: {} },
                },
            });
            const drawIsComplete = pendingPrizes === 0;
            if (drawIsComplete) {
                await tx.luckyPass.updateMany({
                    where: {
                        raffleId: raffleId,
                        status: 'active',
                    },
                    data: { status: 'used' },
                });
                await tx.raffle.update({
                    where: { id: raffleId },
                    data: { status: 'drawn' },
                });
                this.logger.log(`Sorteo completado para rifa ${raffleId}. Todos los premios asignados.`);
            }
            else {
                this.logger.log(`Quedan ${pendingPrizes} premios pendientes para rifa ${raffleId}`);
            }
            return {
                winner: {
                    prizeId: prizeToDraw.id,
                    prizeName: prizeToDraw.name || 'Premio sin nombre',
                    prizeDescription: prizeToDraw.description,
                    luckyPassId: winnerPass.id,
                    passNumber: winnerPass.ticketNumber ?? 0,
                    userId: winnerPass.userId ?? '',
                    winnerName: userFullName,
                    userName: userFullName,
                    userEmail: winnerPass.user?.email ?? null,
                },
                isComplete: drawIsComplete,
            };
        });
        const result = {
            raffleId,
            drawnAt: new Date(),
            winners: [winner],
            discarded: [],
            isComplete,
        };
        if (winner.userEmail) {
            void this.notifications.sendWinnerEmail({
                toEmail: winner.userEmail,
                toName: winner.userName ?? 'Ganador',
                prizeName: winner.prizeName,
                passNumber: winner.passNumber,
                raffleName: raffle.title ?? null,
            });
        }
        return result;
    }
    async getDrawResults(raffleId) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException(`Rifa con ID ${raffleId} no encontrada`);
        }
        if (raffle.status !== 'drawn') {
            return null;
        }
        const winners = await this.prisma.prizeWinner.findMany({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
            include: {
                prize: { include: { milestone: true } },
                luckyPass: true,
                user: true,
            },
            orderBy: {
                prize: { milestone: { sortOrder: 'asc' } },
            },
        });
        return {
            raffleId,
            drawnAt: winners[0]?.createdAt || new Date(),
            winners: winners.map((w) => {
                const userFullName = this.buildUserFullName(w.user ?? null);
                return {
                    prizeId: w.prizeId || '',
                    prizeName: w.prize?.name || 'Premio sin nombre',
                    prizeDescription: w.prize?.description || null,
                    luckyPassId: w.luckyPassId || '',
                    passNumber: w.luckyPass?.ticketNumber ?? 0,
                    userId: w.userId || '',
                    winnerName: userFullName,
                    userName: userFullName,
                    userEmail: w.user?.email ?? null,
                };
            }),
            discarded: [],
        };
    }
    async getAdminDrawResults(raffleId) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException(`Rifa con ID ${raffleId} no encontrada`);
        }
        if (raffle.status !== 'drawn') {
            return null;
        }
        const winners = await this.prisma.prizeWinner.findMany({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
            include: {
                prize: { include: { milestone: true } },
                luckyPass: true,
                user: true,
            },
            orderBy: {
                prize: { milestone: { sortOrder: 'asc' } },
            },
        });
        return {
            raffleId,
            drawnAt: winners[0]?.createdAt || new Date(),
            winners: winners.map((w) => {
                const userFullName = this.buildUserFullName(w.user ?? null);
                return {
                    prizeId: w.prizeId || '',
                    prizeName: w.prize?.name || 'Premio sin nombre',
                    prizeDescription: w.prize?.description || null,
                    luckyPassId: w.luckyPassId || '',
                    passNumber: w.luckyPass?.ticketNumber ?? 0,
                    userId: w.userId || '',
                    winnerName: userFullName,
                    userName: userFullName,
                    userEmail: w.user?.email ?? null,
                    userPhone: w.user?.phone ?? null,
                    userAddress: w.user?.address ?? null,
                };
            }),
            discarded: [],
        };
    }
    async canExecuteDraw(raffleId) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            return { canDraw: false, reason: 'Rifa no encontrada', prizesCount: 0, activePassesCount: 0 };
        }
        if (raffle.status !== 'closed') {
            return {
                canDraw: false,
                reason: `La rifa debe estar cerrada (estado actual: ${raffle.status})`,
                prizesCount: 0,
                activePassesCount: 0,
            };
        }
        const prizes = await this.prisma.prize.count({
            where: {
                raffleId: raffleId,
                milestone: {
                    isUnlocked: true,
                },
            },
        });
        const existingWinners = await this.prisma.prizeWinner.count({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
        });
        if (existingWinners >= prizes && prizes > 0) {
            return {
                canDraw: false,
                reason: 'Todos los premios ya han sido asignados',
                prizesCount: prizes,
                activePassesCount: 0,
                winnersCount: existingWinners,
                pendingPrizesCount: 0,
            };
        }
        const activePasses = await this.prisma.luckyPass.count({
            where: {
                raffleId: raffleId,
                status: 'active',
            },
        });
        if (prizes === 0) {
            return {
                canDraw: false,
                reason: 'No hay premios desbloqueados',
                prizesCount: 0,
                activePassesCount: activePasses,
            };
        }
        if (activePasses === 0) {
            return {
                canDraw: false,
                reason: 'No hay LuckyPasses activos',
                prizesCount: prizes,
                activePassesCount: 0,
            };
        }
        return {
            canDraw: true,
            prizesCount: prizes,
            activePassesCount: activePasses,
            winnersCount: existingWinners,
            pendingPrizesCount: prizes - existingWinners,
        };
    }
    async getWinnersCount(raffleId) {
        return this.prisma.prizeWinner.count({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
        });
    }
    async getUnlockedPrizesCount(raffleId) {
        return this.prisma.prize.count({
            where: {
                raffleId: raffleId,
                milestone: {
                    isUnlocked: true,
                },
            },
        });
    }
    async resetDraw(raffleId, operatorId) {
        void operatorId;
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        if (raffle.status !== 'drawn') {
            throw new common_1.BadRequestException(`La rifa no está en estado 'drawn' (estado actual: ${raffle.status})`);
        }
        await this.prisma.$transaction(async (tx) => {
            const prizes = await tx.prize.findMany({
                where: { raffleId },
                select: { id: true },
            });
            const prizeIds = prizes.map((p) => p.id);
            if (prizeIds.length > 0) {
                await tx.prizeWinner.deleteMany({
                    where: {
                        prizeId: {
                            in: prizeIds,
                        },
                    },
                });
            }
            await tx.luckyPass.updateMany({
                where: { raffleId },
                data: {
                    status: 'active',
                    isWinner: false,
                },
            });
            await tx.raffle.update({
                where: { id: raffleId },
                data: {
                    status: 'closed',
                },
            });
        });
        return {
            success: true,
            message: 'Sorteo reiniciado correctamente',
            raffleId,
        };
    }
};
exports.DrawService = DrawService;
exports.DrawService = DrawService = DrawService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DrawService);
//# sourceMappingURL=draw.service.js.map