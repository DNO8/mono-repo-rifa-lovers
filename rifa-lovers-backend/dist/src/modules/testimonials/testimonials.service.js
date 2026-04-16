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
exports.TestimonialsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let TestimonialsService = class TestimonialsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const luckyPass = await this.prisma.luckyPass.findUnique({
            where: { id: dto.luckyPassId },
        });
        if (!luckyPass)
            throw new common_1.NotFoundException('LuckyPass no encontrado');
        if (luckyPass.userId !== userId)
            throw new common_1.ForbiddenException('No puedes crear un testimonio para este LuckyPass');
        if (!luckyPass.isWinner)
            throw new common_1.BadRequestException('Solo los ganadores pueden dejar un testimonio');
        const existing = await this.prisma.testimonial.findUnique({
            where: { luckyPassId: dto.luckyPassId },
        });
        if (existing)
            throw new common_1.BadRequestException('Ya dejaste un testimonio para este LuckyPass');
        if (dto.rating < 1 || dto.rating > 5)
            throw new common_1.BadRequestException('El rating debe estar entre 1 y 5');
        if (!dto.text?.trim())
            throw new common_1.BadRequestException('El testimonio no puede estar vacío');
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null;
        const testimonial = await this.prisma.testimonial.create({
            data: {
                raffleId: dto.raffleId,
                userId,
                luckyPassId: dto.luckyPassId,
                text: dto.text.trim(),
                rating: dto.rating,
                isPublished: false,
            },
        });
        return {
            id: testimonial.id,
            raffleId: testimonial.raffleId,
            text: testimonial.text,
            rating: testimonial.rating,
            isPublished: testimonial.isPublished,
            createdAt: testimonial.createdAt.toISOString(),
            userName,
        };
    }
    async getPublishedByRaffle(raffleId) {
        const testimonials = await this.prisma.testimonial.findMany({
            where: { raffleId, isPublished: true },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        return testimonials.map((t) => ({
            id: t.id,
            raffleId: t.raffleId,
            text: t.text,
            rating: t.rating,
            isPublished: t.isPublished,
            createdAt: t.createdAt.toISOString(),
            userName: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || null,
        }));
    }
    async getAll() {
        const testimonials = await this.prisma.testimonial.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
        return testimonials.map((t) => ({
            id: t.id,
            raffleId: t.raffleId,
            text: t.text,
            rating: t.rating,
            isPublished: t.isPublished,
            createdAt: t.createdAt.toISOString(),
            userName: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || null,
            userEmail: t.user?.email ?? null,
        }));
    }
    async publish(id, isPublished) {
        const testimonial = await this.prisma.testimonial.update({
            where: { id },
            data: { isPublished },
            include: { user: true },
        });
        return {
            id: testimonial.id,
            raffleId: testimonial.raffleId,
            text: testimonial.text,
            rating: testimonial.rating,
            isPublished: testimonial.isPublished,
            createdAt: testimonial.createdAt.toISOString(),
            userName: [testimonial.user?.firstName, testimonial.user?.lastName].filter(Boolean).join(' ') || null,
        };
    }
};
exports.TestimonialsService = TestimonialsService;
exports.TestimonialsService = TestimonialsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestimonialsService);
//# sourceMappingURL=testimonials.service.js.map