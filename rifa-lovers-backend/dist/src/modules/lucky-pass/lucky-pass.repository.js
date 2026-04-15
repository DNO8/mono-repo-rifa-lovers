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
exports.LuckyPassRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let LuckyPassRepository = class LuckyPassRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUnique(where, include) {
        return this.prisma.luckyPass.findUnique({ where, include });
    }
    async findFirst(where, include, orderBy) {
        return this.prisma.luckyPass.findFirst({ where, include, orderBy });
    }
    async findMany(where, include, orderBy, skip, take) {
        return this.prisma.luckyPass.findMany({ where, include, orderBy, skip, take });
    }
    async create(data) {
        return this.prisma.luckyPass.create({ data });
    }
    async update(where, data) {
        return this.prisma.luckyPass.update({ where, data });
    }
    async delete(where) {
        return this.prisma.luckyPass.delete({ where });
    }
    async count(where) {
        return this.prisma.luckyPass.count({ where });
    }
    async findByUser(userId, include) {
        return this.prisma.luckyPass.findMany({
            where: { userId },
            include,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByRaffle(raffleId, include) {
        return this.prisma.luckyPass.findMany({
            where: { raffleId },
            include,
            orderBy: { ticketNumber: 'asc' },
        });
    }
    async findByUserPack(userPackId) {
        return this.prisma.luckyPass.findMany({
            where: { userPackId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.luckyPass.update({
            where: { id },
            data: { status },
        });
    }
    async markAsWinner(id) {
        return this.prisma.luckyPass.update({
            where: { id },
            data: { isWinner: true, status: 'winner' },
        });
    }
    async findActiveByUser(userId) {
        return this.prisma.luckyPass.findMany({
            where: { userId, status: 'active' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findWinnersByRaffle(raffleId) {
        return this.prisma.luckyPass.findMany({
            where: { raffleId, isWinner: true },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findByTicketNumber(raffleId, ticketNumber) {
        return this.prisma.luckyPass.findFirst({
            where: { raffleId, ticketNumber },
        });
    }
    async countByUserAndStatus(userId, status) {
        const where = { userId };
        if (status) {
            where.status = status;
        }
        return this.prisma.luckyPass.count({ where });
    }
    async countWinnersByUser(userId) {
        return this.prisma.luckyPass.count({
            where: { userId, isWinner: true },
        });
    }
    async createMany(data) {
        return this.prisma.luckyPass.createMany({
            data,
            skipDuplicates: true,
        });
    }
};
exports.LuckyPassRepository = LuckyPassRepository;
exports.LuckyPassRepository = LuckyPassRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LuckyPassRepository);
//# sourceMappingURL=lucky-pass.repository.js.map