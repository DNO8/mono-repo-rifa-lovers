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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NewsletterController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsletterController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const newsletter_service_1 = require("./newsletter.service");
const dto_1 = require("./dto");
const decorators_1 = require("../../common/decorators");
const roles_guard_1 = require("../users/guards/roles.guard");
let NewsletterController = NewsletterController_1 = class NewsletterController {
    constructor(newsletterService) {
        this.newsletterService = newsletterService;
        this.logger = new common_1.Logger(NewsletterController_1.name);
    }
    async checkSubscription(email) {
        this.logger.log(`GET /newsletter/check — ${email}`);
        return this.newsletterService.checkSubscription(email);
    }
    async subscribe(dto) {
        this.logger.log(`POST /newsletter/subscribe — ${dto.email}`);
        return this.newsletterService.subscribe(dto);
    }
    async unsubscribe(email) {
        this.logger.log(`DELETE /newsletter/unsubscribe — ${email}`);
        return this.newsletterService.unsubscribe(email);
    }
    async getSubscribers() {
        this.logger.log('GET /newsletter/subscribers');
        return this.newsletterService.getSubscribers();
    }
    async getCampaigns() {
        this.logger.log('GET /newsletter/campaigns');
        return this.newsletterService.getCampaigns();
    }
    async sendCampaign(dto, adminId) {
        this.logger.log(`POST /newsletter/send — "${dto.subject}" by ${adminId}`);
        return this.newsletterService.sendCampaign(dto, adminId);
    }
};
exports.NewsletterController = NewsletterController;
__decorate([
    (0, common_1.Get)('check'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "checkSubscription", null);
__decorate([
    (0, common_1.Post)('subscribe'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SubscribeDto]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "subscribe", null);
__decorate([
    (0, common_1.Delete)('unsubscribe'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "unsubscribe", null);
__decorate([
    (0, common_1.Get)('subscribers'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "getSubscribers", null);
__decorate([
    (0, common_1.Get)('campaigns'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "getCampaigns", null);
__decorate([
    (0, common_1.Post)('send'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SendCampaignDto, String]),
    __metadata("design:returntype", Promise)
], NewsletterController.prototype, "sendCampaign", null);
exports.NewsletterController = NewsletterController = NewsletterController_1 = __decorate([
    (0, common_1.Controller)('newsletter'),
    __metadata("design:paramtypes", [newsletter_service_1.NewsletterService])
], NewsletterController);
//# sourceMappingURL=newsletter.controller.js.map