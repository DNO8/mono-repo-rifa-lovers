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
exports.RafflesRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RafflesRepository = class RafflesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findUnique(where, include) {
        return this.prisma.raffle.findUnique({ where, include });
    }
    async findFirst(where, include, orderBy) {
        return this.prisma.raffle.findFirst({ where, include, orderBy });
    }
    async findMany(where, include, orderBy, skip, take) {
        return this.prisma.raffle.findMany({ where, include, orderBy, skip, take });
    }
    async create(data) {
        return this.prisma.raffle.create({ data });
    }
    async update(where, data) {
        return this.prisma.raffle.update({ where, data });
    }
    async delete(where) {
        return this.prisma.raffle.delete({ where });
    }
    async count(where) {
        return this.prisma.raffle.count({ where });
    }
    async findActiveWithProgress() {
        return this.prisma.raffle.findFirst({
            where: { status: 'active' },
            include: {
                progress: true,
                milestones: {
                    include: {
                        prizes: true,
                    },
                },
                _count: {
                    select: {
                        purchases: true,
                        luckyPasses: true,
                    },
                },
            },
        });
    }
    async findByStatus(status) {
        return this.prisma.raffle.findMany({
            where: { status },
            include: {
                progress: true,
                _count: {
                    select: {
                        purchases: true,
                        luckyPasses: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.raffle.update({
            where: { id },
            data: { status },
        });
    }
    async findWithPrizes(id) {
        return this.prisma.raffle.findUnique({
            where: { id },
            include: {
                prizes: {
                    include: {
                        milestone: true,
                    },
                },
                milestones: {
                    include: {
                        prizes: true,
                    },
                },
            },
        });
    }
    async findUserRaffles() {
        return this.prisma.raffle.findMany({
            where: {
                OR: [
                    { status: 'active' },
                    { status: 'drawn' },
                ],
                purchases: {
                    some: {},
                },
            },
            include: {
                progress: true,
                milestones: {
                    include: {
                        prizes: true,
                    },
                },
                _count: {
                    select: {
                        purchases: true,
                        luckyPasses: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findActiveExpiredRaffles() {
        return this.prisma.raffle.findMany({
            where: {
                status: 'active',
                endDate: {
                    lte: new Date(),
                },
            },
            select: {
                id: true,
                title: true,
                endDate: true,
                status: true,
            },
        });
    }
    async getUniqueParticipants(raffleId) {
        const participants = await this.prisma.luckyPass.groupBy({
            by: ['userId'],
            where: {
                raffleId,
                status: 'active',
            },
            _count: {
                id: true,
            },
        });
        const result = await Promise.all(participants.map(async (participant) => {
            const user = await this.prisma.user.findUnique({
                where: { id: participant.userId || '' },
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                },
            });
            const luckyPasses = await this.prisma.luckyPass.findMany({
                where: {
                    raffleId,
                    userId: participant.userId || '',
                    status: 'active',
                },
                select: { id: true },
            });
            return {
                userId: participant.userId || '',
                email: user?.email || null,
                firstName: user?.firstName || null,
                lastName: user?.lastName || null,
                luckyPassIds: luckyPasses.map(lp => lp.id),
            };
        }));
        return result;
    }
    async getUserById(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                organizationId: true,
                role: true,
            },
        });
    }
};
exports.RafflesRepository = RafflesRepository;
exports.RafflesRepository = RafflesRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RafflesRepository);
//# sourceMappingURL=raffles.repository.js.map