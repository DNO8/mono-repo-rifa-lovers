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
var AdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let AdminService = AdminService_1 = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async createRaffle(adminId, dto) {
        this.logger.log(`Admin ${adminId} creando rifa: ${dto.title}`);
        const raffle = await this.prisma.raffle.create({
            data: {
                title: dto.title,
                description: dto.description,
                goalPacks: dto.goalPacks,
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                status: dto.status || client_1.RaffleStatus.draft,
            },
        });
        this.logger.log(`Rifa creada: ${raffle.id}`);
        return raffle;
    }
    async updateRaffle(raffleId, dto) {
        this.logger.log(`Actualizando rifa: ${raffleId}`);
        const existing = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Rifa no encontrada');
        }
        const updateData = {};
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
        this.logger.log(`Rifa actualizada: ${raffle.id}`);
        return raffle;
    }
    async updateRaffleStatus(raffleId, dto) {
        this.logger.log(`Cambiando estado de rifa ${raffleId} a: ${dto.status}`);
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
            [client_1.RaffleStatus.closed]: [client_1.RaffleStatus.drawn],
            [client_1.RaffleStatus.drawn]: [],
        };
        if (!validTransitions[raffle.status].includes(dto.status)) {
            throw new common_1.BadRequestException(`No se puede cambiar de ${raffle.status} a ${dto.status}. Transiciones válidas: ${validTransitions[raffle.status].join(', ')}`);
        }
        const updated = await this.prisma.raffle.update({
            where: { id: raffleId },
            data: { status: dto.status },
        });
        this.logger.log(`Estado actualizado: ${raffle.status} → ${dto.status}`);
        return updated;
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
        this.logger.log('Obteniendo KPIs');
        const [totalSalesAgg, packsSold, activeUsers, activeRaffles, totalPurchases, pendingPurchases, completedPurchases, totalLuckyPasses, winnersCount,] = await Promise.all([
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
            totalLuckyPasses,
            winnersCount,
        };
    }
    async updateUserRole(userId, dto) {
        this.logger.log(`Cambiando rol de usuario ${userId} a: ${dto.role}`);
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
        this.logger.log(`Rol actualizado: ${user.role} → ${dto.role}`);
        return updated;
    }
    async updateUserStatus(userId, dto) {
        this.logger.log(`Cambiando estado de usuario ${userId} a: ${dto.status}`);
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
        this.logger.log(`Estado actualizado: ${user.status} → ${dto.status}`);
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
                    _count: {
                        select: { purchases: true, luckyPasses: true },
                    },
                },
            }),
            this.prisma.user.count(),
        ]);
        return { users, total, skip, take };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map