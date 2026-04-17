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
    async executeDraw(raffleId, adminUserId) {
        this.logger.log(`Iniciando sorteo para rifa: ${raffleId}, admin: ${adminUserId}`);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException(`Rifa con ID ${raffleId} no encontrada`);
        }
        if (raffle.status !== 'closed') {
            throw new common_1.BadRequestException(`No se puede ejecutar el sorteo. La rifa debe estar en estado 'closed' pero está en '${raffle.status}'`);
        }
        const existingWinners = await this.prisma.prizeWinner.count({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
        });
        if (existingWinners > 0) {
            throw new common_1.BadRequestException('El sorteo ya ha sido ejecutado para esta rifa');
        }
        const prizes = await this.prisma.prize.findMany({
            where: {
                raffleId: raffleId,
                milestone: {
                    isUnlocked: true,
                },
            },
            include: {
                milestone: true,
            },
            orderBy: {
                milestone: {
                    sortOrder: 'asc',
                },
            },
        });
        if (prizes.length === 0) {
            throw new common_1.BadRequestException('No hay premios desbloqueados para sortear');
        }
        this.logger.log(`${prizes.length} premios disponibles para sorteo`);
        const activePasses = await this.prisma.luckyPass.findMany({
            where: {
                raffleId: raffleId,
                status: 'active',
            },
            include: {
                user: true,
            },
        });
        if (activePasses.length === 0) {
            throw new common_1.BadRequestException('No hay LuckyPasses activos para participar en el sorteo');
        }
        this.logger.log(`${activePasses.length} LuckyPasses activos participando`);
        const winners = await this.prisma.$transaction(async (tx) => {
            const drawWinners = [];
            const usedPassIds = new Set();
            const shuffledPasses = [...activePasses];
            for (let i = shuffledPasses.length - 1; i > 0; i--) {
                const j = (0, crypto_1.randomInt)(0, i + 1);
                [shuffledPasses[i], shuffledPasses[j]] = [shuffledPasses[j], shuffledPasses[i]];
            }
            let passIndex = 0;
            for (const prize of prizes) {
                while (passIndex < shuffledPasses.length && usedPassIds.has(shuffledPasses[passIndex].id)) {
                    passIndex++;
                }
                if (passIndex >= shuffledPasses.length) {
                    this.logger.warn(`No hay suficientes LuckyPasses para todos los premios`);
                    break;
                }
                const winnerPass = shuffledPasses[passIndex];
                usedPassIds.add(winnerPass.id);
                await tx.prizeWinner.create({
                    data: {
                        prizeId: prize.id,
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
                const userFullName = this.buildUserFullName(winnerPass.user ?? null);
                drawWinners.push({
                    prizeId: prize.id,
                    prizeName: prize.name || 'Premio sin nombre',
                    prizeDescription: prize.description,
                    luckyPassId: winnerPass.id,
                    passNumber: winnerPass.ticketNumber ?? 0,
                    userId: winnerPass.userId ?? '',
                    winnerName: userFullName,
                    userName: userFullName,
                    userEmail: winnerPass.user?.email ?? null,
                });
                this.logger.log(`Ganador asignado: Prize=${prize.name}, Pass=${winnerPass.ticketNumber}, User=${winnerPass.user?.email}`);
                passIndex++;
            }
            await tx.raffle.update({
                where: { id: raffleId },
                data: {
                    status: 'drawn',
                },
            });
            this.logger.log(`Sorteo completado para rifa ${raffleId}. ${drawWinners.length} ganadores.`);
            return drawWinners;
        });
        const result = {
            raffleId,
            drawnAt: new Date(),
            winners,
            discarded: [],
        };
        const drawnRaffle = await this.prisma.raffle.findUnique({ where: { id: raffleId } });
        for (const winner of winners) {
            if (winner.userEmail) {
                void this.notifications.sendWinnerEmail({
                    toEmail: winner.userEmail,
                    toName: winner.userName ?? 'Ganador',
                    prizeName: winner.prizeName,
                    passNumber: winner.passNumber,
                    raffleName: drawnRaffle?.title ?? null,
                });
            }
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
                prize: true,
                luckyPass: true,
                user: true,
            },
            orderBy: {
                createdAt: 'asc',
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
        const existingWinners = await this.prisma.prizeWinner.count({
            where: {
                prize: {
                    raffleId: raffleId,
                },
            },
        });
        if (existingWinners > 0) {
            return {
                canDraw: false,
                reason: 'El sorteo ya ha sido ejecutado',
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
};
exports.DrawService = DrawService;
exports.DrawService = DrawService = DrawService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notifications_service_1.NotificationsService])
], DrawService);
//# sourceMappingURL=draw.service.js.map