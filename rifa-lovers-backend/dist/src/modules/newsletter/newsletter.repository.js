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
exports.NewsletterRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let NewsletterRepository = class NewsletterRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findSubscriberByEmail(email) {
        return this.prisma.newsletterSubscriber.findUnique({ where: { email } });
    }
    async createSubscriber(data) {
        return this.prisma.newsletterSubscriber.create({ data });
    }
    async reactivateSubscriber(email, name) {
        return this.prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                isActive: true,
                unsubscribedAt: null,
                ...(name ? { name } : {}),
            },
        });
    }
    async deactivateSubscriber(email) {
        return this.prisma.newsletterSubscriber.update({
            where: { email },
            data: {
                isActive: false,
                unsubscribedAt: new Date(),
            },
        });
    }
    async findActiveSubscribers() {
        return this.prisma.newsletterSubscriber.findMany({
            where: { isActive: true },
            orderBy: { subscribedAt: 'desc' },
        });
    }
    async countActiveSubscribers() {
        return this.prisma.newsletterSubscriber.count({ where: { isActive: true } });
    }
    async findAllSubscribers() {
        return this.prisma.newsletterSubscriber.findMany({
            orderBy: { subscribedAt: 'desc' },
        });
    }
    async createCampaign(data) {
        return this.prisma.newsletterCampaign.create({ data });
    }
    async findAllCampaigns() {
        return this.prisma.newsletterCampaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { firstName: true, lastName: true, email: true } } },
        });
    }
};
exports.NewsletterRepository = NewsletterRepository;
exports.NewsletterRepository = NewsletterRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NewsletterRepository);
//# sourceMappingURL=newsletter.repository.js.map