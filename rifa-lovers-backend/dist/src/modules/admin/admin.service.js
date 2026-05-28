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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const resend_service_1 = require("../email/resend.service");
let AdminService = class AdminService {
    constructor(prisma, resendService, configService) {
        this.prisma = prisma;
        this.resendService = resendService;
        this.configService = configService;
    }
    async createRaffle(adminId, dto) {
        const prizes = dto.prizes ?? [];
        const goalPacks = dto.goalPacks;
        const segmentSize = Math.floor(goalPacks / prizes.length);
        const result = await this.prisma.$transaction(async (tx) => {
            const raffle = await tx.raffle.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    goalPacks,
                    maxTicketNumber: dto.maxTicketNumber ?? 30000,
                    startDate: dto.startDate ? new Date(dto.startDate) : null,
                    endDate: dto.endDate ? new Date(dto.endDate) : null,
                    status: dto.status || client_1.RaffleStatus.draft,
                },
            });
            await tx.raffleProgress.create({
                data: {
                    raffleId: raffle.id,
                    packsSold: 0,
                    revenueTotal: 0,
                    percentageToGoal: 0,
                },
            });
            for (let i = 0; i < prizes.length; i++) {
                const prizeDto = prizes[i];
                const requiredPacks = i === prizes.length - 1 ? goalPacks : segmentSize * (i + 1);
                const milestone = await tx.milestone.create({
                    data: {
                        raffleId: raffle.id,
                        name: `Meta ${i + 1}`,
                        requiredPacks,
                        sortOrder: i + 1,
                    },
                });
                await tx.prize.create({
                    data: {
                        raffleId: raffle.id,
                        milestoneId: milestone.id,
                        type: 'milestone',
                        name: prizeDto.name,
                        description: prizeDto.description ?? null,
                        quantity: prizeDto.quantity ?? 1,
                        valueEstimated: prizeDto.valueEstimated ?? null,
                    },
                });
            }
            return raffle;
        });
        return {
            id: result.id,
            title: result.title,
            description: result.description,
            goalPacks: result.goalPacks,
            status: result.status,
            startDate: result.startDate,
            endDate: result.endDate,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
            packsSold: 0,
            progressPercentage: 0,
            totalRevenue: 0,
        };
    }
    async updateRaffle(raffleId, dto) {
        const existing = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const updateData = {};
        if (dto.maxTicketNumber !== undefined)
            updateData.maxTicketNumber = dto.maxTicketNumber;
        if (dto.title !== undefined)
            updateData.title = dto.title;
        if (dto.description !== undefined)
            updateData.description = dto.description;
        if (dto.goalPacks !== undefined)
            updateData.goalPacks = dto.goalPacks;
        if (dto.startDate !== undefined)
            updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
        if (dto.endDate !== undefined)
            updateData.endDate = dto.endDate ? new Date(dto.endDate) : null;
        if (dto.status !== undefined)
            updateData.status = dto.status;
        const raffle = await this.prisma.raffle.update({
            where: { id: raffleId },
            data: updateData,
        });
        return raffle;
    }
    async updateRaffleStatus(raffleId, dto) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const validTransitions = {
            [client_1.RaffleStatus.draft]: [client_1.RaffleStatus.active],
            [client_1.RaffleStatus.active]: [client_1.RaffleStatus.sold_out, client_1.RaffleStatus.closed],
            [client_1.RaffleStatus.sold_out]: [client_1.RaffleStatus.closed],
            [client_1.RaffleStatus.closed]: [client_1.RaffleStatus.drawn, client_1.RaffleStatus.active],
            [client_1.RaffleStatus.drawn]: [],
        };
        if (!validTransitions[raffle.status].includes(dto.status)) {
            throw new common_1.BadRequestException(`No se puede cambiar de ${raffle.status} a ${dto.status}. Transiciones válidas: ${validTransitions[raffle.status].join(', ')}`);
        }
        const updated = await this.prisma.raffle.update({
            where: { id: raffleId },
            data: { status: dto.status },
        });
        return updated;
    }
    async getRaffleDetail(raffleId) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
            include: {
                _count: {
                    select: {
                        luckyPasses: true,
                        purchases: true,
                    },
                },
            },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        return {
            id: raffle.id,
            title: raffle.title,
            description: raffle.description,
            goalPacks: raffle.goalPacks,
            maxTicketNumber: raffle.maxTicketNumber,
            status: raffle.status,
            createdAt: raffle.createdAt.toISOString(),
            endDate: raffle.endDate ? raffle.endDate.toISOString() : null,
            totalPasses: raffle._count.luckyPasses,
            totalPurchases: raffle._count.purchases,
        };
    }
    async getRaffleParticipants(raffleId) {
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!raffle) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const luckyPasses = await this.prisma.luckyPass.findMany({
            where: { raffleId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
        });
        const participantsMap = new Map();
        for (const pass of luckyPasses) {
            if (!pass.user)
                continue;
            const userId = pass.user.id;
            if (!participantsMap.has(userId)) {
                const fullName = `${pass.user.firstName ?? ''} ${pass.user.lastName ?? ''}`.trim();
                participantsMap.set(userId, {
                    id: userId,
                    name: fullName || (pass.user.email ?? ''),
                    email: pass.user.email ?? '',
                    ticketCount: 0,
                    tickets: [],
                });
            }
            const participant = participantsMap.get(userId);
            participant.ticketCount++;
            if (pass.ticketNumber !== null) {
                participant.tickets.push(pass.ticketNumber);
            }
        }
        return Array.from(participantsMap.values());
    }
    async getAllRaffles() {
        const raffles = await this.prisma.raffle.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { luckyPasses: true },
                },
                purchases: {
                    where: { status: 'paid' },
                    select: { totalAmount: true, userPacks: { select: { quantity: true } } },
                },
            },
        });
        return raffles.map((raffle) => {
            const packsSold = raffle.purchases.reduce((sum, p) => {
                return sum + p.userPacks.reduce((s, up) => s + up.quantity, 0);
            }, 0);
            const progressPercentage = raffle.goalPacks > 0
                ? Math.min(100, Math.round((packsSold / raffle.goalPacks) * 100))
                : 0;
            const totalRevenue = raffle.purchases.reduce((sum, p) => {
                const amount = p.totalAmount ? Number(p.totalAmount) : 0;
                return sum + amount;
            }, 0);
            return {
                id: raffle.id,
                title: raffle.title,
                description: raffle.description,
                goalPacks: raffle.goalPacks,
                status: raffle.status,
                startDate: raffle.startDate,
                endDate: raffle.endDate,
                createdAt: raffle.createdAt,
                updatedAt: raffle.updatedAt,
                packsSold,
                progressPercentage,
                totalRevenue,
            };
        });
    }
    async getKpis() {
        const [totalSalesAgg, packsSold, activeUsers, activeRaffles, totalPurchases, pendingPurchases, completedPurchases, failedPurchases, refundedPurchases, totalLuckyPasses, winnersCount,] = await Promise.all([
            this.prisma.purchase.aggregate({
                where: { status: 'paid' },
                _sum: { totalAmount: true },
            }),
            this.prisma.userPack.count({
                where: { purchase: { status: 'paid' } },
            }),
            this.prisma.user.count({
                where: { status: client_1.UserStatus.active },
            }),
            this.prisma.raffle.count({
                where: { status: client_1.RaffleStatus.active },
            }),
            this.prisma.purchase.count(),
            this.prisma.purchase.count({
                where: { status: 'pending' },
            }),
            this.prisma.purchase.count({
                where: { status: 'paid' },
            }),
            this.prisma.purchase.count({
                where: { status: 'failed' },
            }),
            this.prisma.purchase.count({
                where: { status: 'refunded' },
            }),
            this.prisma.luckyPass.count(),
            this.prisma.prizeWinner.count(),
        ]);
        const totalSales = totalSalesAgg._sum.totalAmount
            ? Number(totalSalesAgg._sum.totalAmount)
            : 0;
        return {
            totalSales,
            packsSold,
            activeUsers,
            activeRaffles,
            totalPurchases,
            pendingPurchases,
            completedPurchases,
            failedPurchases,
            refundedPurchases,
            totalLuckyPasses,
            winnersCount,
        };
    }
    async updateUserRole(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { role: dto.role },
        });
        if ((dto.role === 'admin' || dto.role === 'operator') && user.email) {
            try {
                void this.resendService.sendPromotedRoleEmail({
                    toEmail: user.email,
                    toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Usuario',
                    role: dto.role,
                    frontendUrl: this.configService.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
                });
            }
            catch (err) {
            }
        }
        return updated;
    }
    async updateUserStatus(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuario no encontrado');
        }
        const updated = await this.prisma.user.update({
            where: { id: userId },
            data: { status: dto.status },
        });
        return updated;
    }
    async getAllUsers(skip = 0, take = 50) {
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    purchases: {
                        select: { status: true },
                    },
                    _count: {
                        select: { luckyPasses: true },
                    },
                },
            }),
            this.prisma.user.count(),
        ]);
        const usersWithCounts = users.map((user) => {
            const paid = user.purchases.filter((p) => p.status === 'paid').length;
            const pending = user.purchases.filter((p) => p.status === 'pending').length;
            const failed = user.purchases.filter((p) => p.status === 'failed').length;
            const refunded = user.purchases.filter((p) => p.status === 'refunded').length;
            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt,
                _count: {
                    purchases: { paid, pending, failed, refunded },
                    luckyPasses: user._count.luckyPasses,
                },
            };
        });
        return { users: usersWithCounts, total, skip, take };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        resend_service_1.ResendService,
        config_1.ConfigService])
], AdminService);
//# sourceMappingURL=admin.service.js.map