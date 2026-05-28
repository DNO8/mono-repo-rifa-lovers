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
var NewsletterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterService = void 0;
const common_1 = require("@nestjs/common");
const newsletter_repository_1 = require("./newsletter.repository");
const resend_service_1 = require("../email/resend.service");
let NewsletterService = NewsletterService_1 = class NewsletterService {
    constructor(newsletterRepository, resendService) {
        this.newsletterRepository = newsletterRepository;
        this.resendService = resendService;
        this.logger = new common_1.Logger(NewsletterService_1.name);
    }
    async checkSubscription(email) {
        const subscriber = await this.newsletterRepository.findSubscriberByEmail(email);
        return { subscribed: subscriber ? subscriber.isActive : false };
    }
    async subscribe(dto) {
        const existing = await this.newsletterRepository.findSubscriberByEmail(dto.email);
        if (existing && existing.isActive) {
            this.logger.log(`Suscripción idempotente: ${dto.email} ya está suscrito`);
            return existing;
        }
        if (existing && !existing.isActive) {
            this.logger.log(`Reactivando suscripción: ${dto.email}`);
            return this.newsletterRepository.reactivateSubscriber(dto.email, dto.name);
        }
        this.logger.log(`Nueva suscripción: ${dto.email}`);
        return this.newsletterRepository.createSubscriber({
            email: dto.email,
            name: dto.name,
        });
    }
    async unsubscribe(email) {
        const existing = await this.newsletterRepository.findSubscriberByEmail(email);
        if (!existing || !existing.isActive) {
            return { message: 'No estás suscrito al newsletter' };
        }
        this.logger.log(`Desuscribiendo: ${email}`);
        await this.newsletterRepository.deactivateSubscriber(email);
        return { message: 'Te has desuscrito exitosamente' };
    }
    async getSubscribers() {
        const subscribers = await this.newsletterRepository.findAllSubscribers();
        const activeCount = await this.newsletterRepository.countActiveSubscribers();
        return { subscribers, activeCount, totalCount: subscribers.length };
    }
    async getCampaigns() {
        return this.newsletterRepository.findAllCampaigns();
    }
    async sendCampaign(dto, adminId) {
        const subscribers = await this.newsletterRepository.findActiveSubscribers();
        if (subscribers.length === 0) {
            return { message: 'No hay suscriptores activos', recipientCount: 0 };
        }
        this.logger.log(`Enviando campaña "${dto.subject}" a ${subscribers.length} suscriptores`);
        let sentCount = 0;
        const errors = [];
        for (const subscriber of subscribers) {
            try {
                await this.resendService.sendNewsletterEmail({
                    toEmail: subscriber.email,
                    toName: subscriber.name ?? undefined,
                    subject: dto.subject,
                    bodyHtml: dto.body,
                    coverImageUrl: dto.coverImageUrl,
                });
                sentCount++;
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                this.logger.error(`Error enviando a ${subscriber.email}: ${msg}`);
                errors.push(subscriber.email);
            }
        }
        const campaign = await this.newsletterRepository.createCampaign({
            subject: dto.subject,
            body: dto.body,
            sentBy: adminId,
            recipientCount: sentCount,
            sentAt: new Date(),
        });
        this.logger.log(`Campaña enviada: ${sentCount}/${subscribers.length} exitosos`);
        return {
            campaignId: campaign.id,
            recipientCount: sentCount,
            totalSubscribers: subscribers.length,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
};
exports.NewsletterService = NewsletterService;
exports.NewsletterService = NewsletterService = NewsletterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [newsletter_repository_1.NewsletterRepository,
        resend_service_1.ResendService])
], NewsletterService);
//# sourceMappingURL=newsletter.service.js.map