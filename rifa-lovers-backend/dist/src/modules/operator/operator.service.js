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
exports.OperatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
const draw_service_1 = require("../draw/draw.service");
const newsletter_service_1 = require("../newsletter/newsletter.service");
const supabase_service_1 = require("../../config/supabase.service");
let OperatorService = class OperatorService {
    constructor(prisma, drawService, newsletterService, supabaseService) {
        this.prisma = prisma;
        this.drawService = drawService;
        this.newsletterService = newsletterService;
        this.supabaseService = supabaseService;
    }
    async assertOrganization(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { organizationId: true, role: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (user.role !== client_1.UserRole.operator && user.role !== client_1.UserRole.admin) {
            throw new common_1.ForbiddenException('Solo operadores pueden acceder a este recurso');
        }
        if (!user.organizationId) {
            throw new common_1.ForbiddenException('Debes completar tu perfil de empresa antes de continuar');
        }
        return user.organizationId;
    }
    async createOrganization(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, organizationId: true },
        });
        if (!user)
            throw new common_1.NotFoundException('Usuario no encontrado');
        if (user.role !== client_1.UserRole.operator && user.role !== client_1.UserRole.admin) {
            throw new common_1.ForbiddenException('Solo operadores o admins pueden crear una organizacion');
        }
        if (user.organizationId) {
            throw new common_1.BadRequestException('Ya tienes una organizacion asignada');
        }
        let slug = dto.slug || dto.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const existing = await this.prisma.organization.findUnique({ where: { slug } });
        if (existing) {
            const suffix = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${suffix}`;
        }
        const org = await this.prisma.organization.create({
            data: { name: dto.name, slug },
        });
        await this.prisma.user.update({
            where: { id: userId },
            data: { organizationId: org.id },
        });
        return org;
    }
    async getOrganization(userId) {
        const orgId = await this.assertOrganization(userId);
        const org = await this.prisma.organization.findUnique({
            where: { id: orgId },
        });
        if (!org)
            throw new common_1.NotFoundException('Organizacion no encontrada');
        return org;
    }
    async getKpis(userId) {
        const orgId = await this.assertOrganization(userId);
        const raffleIds = await this.prisma.raffle.findMany({
            where: { organizationId: orgId },
            select: { id: true },
        }).then(rs => rs.map(r => r.id));
        const [totalSales, packsSold, activeRaffles, totalPurchases, pendingPurchases, completedPurchases, failedPurchases, totalLuckyPasses, winnersCount,] = await this.prisma.$transaction([
            this.prisma.purchase.aggregate({
                where: { raffleId: { in: raffleIds }, status: client_1.PurchaseStatus.paid },
                _sum: { totalAmount: true },
            }),
            this.prisma.raffleProgress.aggregate({
                where: { raffleId: { in: raffleIds } },
                _sum: { packsSold: true },
            }),
            this.prisma.raffle.count({
                where: { organizationId: orgId, status: client_1.RaffleStatus.active },
            }),
            this.prisma.purchase.count({ where: { raffleId: { in: raffleIds } } }),
            this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: client_1.PurchaseStatus.pending } }),
            this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: client_1.PurchaseStatus.paid } }),
            this.prisma.purchase.count({ where: { raffleId: { in: raffleIds }, status: client_1.PurchaseStatus.failed } }),
            this.prisma.luckyPass.count({ where: { raffleId: { in: raffleIds } } }),
            this.prisma.prizeWinner.count({ where: { luckyPass: { raffleId: { in: raffleIds } } } }),
        ]);
        return {
            totalSales: Number(totalSales._sum.totalAmount ?? 0),
            packsSold: packsSold._sum.packsSold ?? 0,
            activeRaffles,
            totalPurchases,
            pendingPurchases,
            completedPurchases,
            failedPurchases,
            totalLuckyPasses,
            winnersCount,
        };
    }
    async getRaffles(userId) {
        const orgId = await this.assertOrganization(userId);
        const raffles = await this.prisma.raffle.findMany({
            where: { organizationId: orgId },
            include: { progress: true, packs: true },
            orderBy: { createdAt: 'desc' },
        });
        return raffles.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            goalPacks: r.goalPacks,
            status: r.status,
            startDate: r.startDate,
            endDate: r.endDate,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            coverImageUrl: r.coverImageUrl,
            packsSold: r.progress?.packsSold ?? 0,
            progressPercentage: Number(r.progress?.percentageToGoal ?? 0),
            totalRevenue: Number(r.progress?.revenueTotal ?? 0),
        }));
    }
    async createRaffle(userId, dto) {
        const orgId = await this.assertOrganization(userId);
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
                    organizationId: orgId,
                },
            });
            for (let i = 0; i < prizes.length; i++) {
                const prizeDto = prizes[i];
                const requiredPacks = i === prizes.length - 1 ? goalPacks : segmentSize * (i + 1);
                const milestone = await tx.milestone.create({
                    data: {
                        name: `Meta ${i + 1}`,
                        requiredPacks,
                        raffleId: raffle.id,
                        sortOrder: i + 1,
                    },
                });
                await tx.prize.create({
                    data: {
                        name: prizeDto.name,
                        description: prizeDto.description ?? null,
                        raffleId: raffle.id,
                        milestoneId: milestone.id,
                        type: 'milestone',
                        quantity: prizeDto.quantity ?? 1,
                        valueEstimated: prizeDto.valueEstimated ?? null,
                    },
                });
            }
            await tx.raffleProgress.create({
                data: {
                    raffleId: raffle.id,
                    packsSold: 0,
                    revenueTotal: 0,
                    percentageToGoal: 0,
                },
            });
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
            coverImageUrl: result.coverImageUrl,
            packsSold: 0,
            progressPercentage: 0,
            totalRevenue: 0,
        };
    }
    async updateRaffle(userId, raffleId, dto) {
        await this.assertOrganization(userId);
        const updated = await this.prisma.$transaction(async (tx) => {
            const raffle = await tx.raffle.findUnique({
                where: { id: raffleId },
                include: { progress: true },
            });
            if (!raffle)
                throw new common_1.NotFoundException('Rifa no encontrada');
            return tx.raffle.update({
                where: { id: raffleId },
                data: {
                    title: dto.title,
                    description: dto.description,
                    goalPacks: dto.goalPacks,
                    maxTicketNumber: dto.maxTicketNumber,
                    startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                    endDate: dto.endDate ? new Date(dto.endDate) : undefined,
                    status: dto.status,
                },
                include: { progress: true },
            });
        });
        return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            goalPacks: updated.goalPacks,
            status: updated.status,
            startDate: updated.startDate,
            endDate: updated.endDate,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            coverImageUrl: updated.coverImageUrl,
            packsSold: updated.progress?.packsSold ?? 0,
            progressPercentage: Number(updated.progress?.percentageToGoal ?? 0),
            totalRevenue: Number(updated.progress?.revenueTotal ?? 0),
        };
    }
    async updateRaffleStatus(userId, raffleId, dto) {
        await this.assertOrganization(userId);
        const updated = await this.prisma.$transaction(async (tx) => {
            const raffle = await tx.raffle.findUnique({
                where: { id: raffleId },
                include: { progress: true },
            });
            if (!raffle)
                throw new common_1.NotFoundException('Rifa no encontrada');
            return tx.raffle.update({
                where: { id: raffleId },
                data: { status: dto.status },
                include: { progress: true },
            });
        });
        return {
            id: updated.id,
            title: updated.title,
            description: updated.description,
            goalPacks: updated.goalPacks,
            status: updated.status,
            startDate: updated.startDate,
            endDate: updated.endDate,
            createdAt: updated.createdAt,
            updatedAt: updated.updatedAt,
            coverImageUrl: updated.coverImageUrl,
            packsSold: updated.progress?.packsSold ?? 0,
            progressPercentage: Number(updated.progress?.percentageToGoal ?? 0),
            totalRevenue: Number(updated.progress?.revenueTotal ?? 0),
        };
    }
    async uploadCover(userId, raffleId, file) {
        const orgId = await this.assertOrganization(userId);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId, organizationId: orgId },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        const ext = file.mimetype.split('/')[1] || 'jpg';
        const path = `${raffleId}-${Date.now()}.${ext}`;
        const buffer = file.buffer;
        const publicUrl = await this.supabaseService.uploadFile('raffle-covers', path, buffer, file.mimetype);
        await this.prisma.raffle.update({
            where: { id: raffleId },
            data: { coverImageUrl: publicUrl },
        });
        if (raffle.coverImageUrl) {
            try {
                const oldPath = raffle.coverImageUrl.split('/').pop();
                if (oldPath) {
                    await this.supabaseService.deleteFile('raffle-covers', oldPath);
                }
            }
            catch {
            }
        }
        return { coverImageUrl: publicUrl };
    }
    async getPacks(userId, raffleId) {
        const orgId = await this.assertOrganization(userId);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId, organizationId: orgId },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        const packs = await this.prisma.pack.findMany({
            where: { raffleId },
            orderBy: { createdAt: 'desc' },
        });
        return packs.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price ?? 0),
            luckyPassQuantity: p.luckyPassQuantity,
            isFeatured: p.isFeatured,
            isPreSale: p.isPreSale,
            raffleId: p.raffleId,
            createdAt: p.createdAt,
        }));
    }
    async createPack(userId, raffleId, dto) {
        const orgId = await this.assertOrganization(userId);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId, organizationId: orgId },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        const pack = await this.prisma.pack.create({
            data: {
                name: dto.name,
                price: dto.price,
                luckyPassQuantity: dto.luckyPassQuantity,
                isFeatured: dto.isFeatured ?? false,
                isPreSale: dto.isPreSale ?? false,
                raffleId,
            },
        });
        return {
            id: pack.id,
            name: pack.name,
            price: Number(pack.price ?? 0),
            luckyPassQuantity: pack.luckyPassQuantity,
            isFeatured: pack.isFeatured,
            isPreSale: pack.isPreSale,
            raffleId: pack.raffleId,
            createdAt: pack.createdAt,
        };
    }
    async updatePack(userId, packId, dto) {
        await this.assertOrganization(userId);
        const existing = await this.prisma.pack.findUnique({
            where: { id: packId },
            include: { raffle: true },
        });
        if (!existing || !existing.raffle)
            throw new common_1.NotFoundException('Pack no encontrado');
        const updated = await this.prisma.pack.update({
            where: { id: packId },
            data: {
                name: dto.name,
                price: dto.price,
                luckyPassQuantity: dto.luckyPassQuantity,
                isFeatured: dto.isFeatured,
                isPreSale: dto.isPreSale,
            },
        });
        return {
            id: updated.id,
            name: updated.name,
            price: Number(updated.price ?? 0),
            luckyPassQuantity: updated.luckyPassQuantity,
            isFeatured: updated.isFeatured,
            isPreSale: updated.isPreSale,
            raffleId: updated.raffleId,
            createdAt: updated.createdAt,
        };
    }
    async deletePack(userId, packId) {
        await this.assertOrganization(userId);
        const existing = await this.prisma.pack.findUnique({
            where: { id: packId },
            include: { raffle: true, userPacks: true },
        });
        if (!existing || !existing.raffle)
            throw new common_1.NotFoundException('Pack no encontrado');
        const hasPurchases = existing.userPacks.some(up => up.purchaseId !== null);
        if (hasPurchases) {
            throw new common_1.BadRequestException('No se puede eliminar un pack que tiene compras asociadas.');
        }
        await this.prisma.pack.delete({ where: { id: packId } });
    }
    async getParticipants(userId, raffleId) {
        await this.assertOrganization(userId);
        const raffle = await this.prisma.raffle.findUnique({
            where: { id: raffleId },
            include: { luckyPasses: { include: { user: true } } },
        });
        if (!raffle)
            throw new common_1.NotFoundException('Rifa no encontrada');
        const participants = raffle.luckyPasses.reduce((acc, lp) => {
            if (!lp.user)
                return acc;
            const key = lp.user.id;
            if (!acc[key]) {
                acc[key] = {
                    id: lp.user.id,
                    name: `${lp.user.firstName ?? ''} ${lp.user.lastName ?? ''}`.trim() || 'Usuario',
                    email: lp.user.email ?? '',
                    ticketCount: 0,
                    tickets: [],
                };
            }
            acc[key].ticketCount++;
            if (lp.ticketNumber)
                acc[key].tickets.push(lp.ticketNumber);
            return acc;
        }, {});
        return Object.values(participants);
    }
    async getDrawStatus(userId, raffleId) {
        await this.assertOrganization(userId);
        const canExecute = await this.drawService.canExecuteDraw(raffleId);
        const results = await this.drawService.getDrawResults(raffleId);
        return {
            canExecute,
            results: results && results.winners.length > 0 ? results : null,
        };
    }
    async executeDraw(userId, raffleId, prizeId) {
        await this.assertOrganization(userId);
        return this.drawService.executeDraw(raffleId, userId, prizeId);
    }
    async getNewsletterCampaigns(userId) {
        await this.assertOrganization(userId);
        return this.prisma.newsletterCampaign.findMany({
            where: { sentBy: userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async sendNewsletter(userId, dto) {
        await this.assertOrganization(userId);
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const campaignsThisMonth = await this.prisma.newsletterCampaign.count({
            where: {
                sentBy: userId,
                createdAt: { gte: startOfMonth },
            },
        });
        if (campaignsThisMonth >= 10) {
            throw new common_1.ForbiddenException('Has alcanzado el limite de 10 campanas mensuales. Contacta al administrador para mas informacion.');
        }
        const orgId = await this.assertOrganization(userId);
        const activeRaffle = await this.prisma.raffle.findFirst({
            where: { organizationId: orgId, status: client_1.RaffleStatus.active },
            select: { coverImageUrl: true },
        });
        const enrichedDto = { ...dto, coverImageUrl: activeRaffle?.coverImageUrl ?? undefined };
        const result = await this.newsletterService.sendCampaign(enrichedDto, userId);
        return {
            ...result,
            remaining: 9 - campaignsThisMonth,
        };
    }
};
exports.OperatorService = OperatorService;
exports.OperatorService = OperatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        draw_service_1.DrawService,
        newsletter_service_1.NewsletterService,
        supabase_service_1.SupabaseService])
], OperatorService);
//# sourceMappingURL=operator.service.js.map