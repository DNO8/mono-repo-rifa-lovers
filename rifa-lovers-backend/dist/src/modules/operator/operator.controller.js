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
var OperatorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const operator_service_1 = require("./operator.service");
const dto_1 = require("./dto");
const dto_2 = require("../admin/dto");
const decorators_1 = require("../../common/decorators");
const roles_guard_1 = require("../users/guards/roles.guard");
let OperatorController = OperatorController_1 = class OperatorController {
    constructor(operatorService) {
        this.operatorService = operatorService;
        this.logger = new common_1.Logger(OperatorController_1.name);
    }
    async getOrganization(userId) {
        return this.operatorService.getOrganization(userId);
    }
    async createOrganization(userId, dto) {
        return this.operatorService.createOrganization(userId, dto);
    }
    async getKpis(userId) {
        return this.operatorService.getKpis(userId);
    }
    async getRaffles(userId) {
        return this.operatorService.getRaffles(userId);
    }
    async createRaffle(userId, dto) {
        return this.operatorService.createRaffle(userId, dto);
    }
    async updateRaffle(userId, raffleId, dto) {
        return this.operatorService.updateRaffle(userId, raffleId, dto);
    }
    async updateRaffleStatus(userId, raffleId, dto) {
        return this.operatorService.updateRaffleStatus(userId, raffleId, dto);
    }
    async uploadCover(userId, raffleId, file) {
        if (!file)
            throw new common_1.BadRequestException('No se envió ningún archivo');
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Formato no permitido. Usa JPG, PNG o WEBP');
        }
        if (file.size > 5 * 1024 * 1024) {
            throw new common_1.BadRequestException('El archivo excede el límite de 5MB');
        }
        return this.operatorService.uploadCover(userId, raffleId, file);
    }
    async getPacks(userId, raffleId) {
        return this.operatorService.getPacks(userId, raffleId);
    }
    async createPack(userId, raffleId, dto) {
        return this.operatorService.createPack(userId, raffleId, dto);
    }
    async updatePack(userId, packId, dto) {
        return this.operatorService.updatePack(userId, packId, dto);
    }
    async deletePack(userId, packId) {
        return this.operatorService.deletePack(userId, packId);
    }
    async getParticipants(userId, raffleId) {
        return this.operatorService.getParticipants(userId, raffleId);
    }
    async getDrawStatus(userId, raffleId) {
        return this.operatorService.getDrawStatus(userId, raffleId);
    }
    async executeDraw(userId, raffleId, prizeId) {
        return this.operatorService.executeDraw(userId, raffleId, prizeId);
    }
    async getNewsletterCampaigns(userId) {
        return this.operatorService.getNewsletterCampaigns(userId);
    }
    async sendNewsletter(userId, dto) {
        return this.operatorService.sendNewsletter(userId, dto);
    }
};
exports.OperatorController = OperatorController;
__decorate([
    (0, common_1.Get)('organization'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getOrganization", null);
__decorate([
    (0, common_1.Post)('organization'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateOrganizationDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "createOrganization", null);
__decorate([
    (0, common_1.Get)('kpis'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Get)('raffles'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getRaffles", null);
__decorate([
    (0, common_1.Post)('raffles'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_2.CreateRaffleDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "createRaffle", null);
__decorate([
    (0, common_1.Patch)('raffles/:id'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_2.UpdateRaffleDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "updateRaffle", null);
__decorate([
    (0, common_1.Patch)('raffles/:id/status'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_2.UpdateRaffleStatusDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "updateRaffleStatus", null);
__decorate([
    (0, common_1.Post)('raffles/:id/upload-cover'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "uploadCover", null);
__decorate([
    (0, common_1.Get)('raffles/:id/packs'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getPacks", null);
__decorate([
    (0, common_1.Post)('raffles/:id/packs'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.CreatePackDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "createPack", null);
__decorate([
    (0, common_1.Patch)('packs/:id'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, dto_1.UpdatePackDto]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "updatePack", null);
__decorate([
    (0, common_1.Delete)('packs/:id'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "deletePack", null);
__decorate([
    (0, common_1.Get)('raffles/:id/participants'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getParticipants", null);
__decorate([
    (0, common_1.Get)('raffles/:id/draw/status'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getDrawStatus", null);
__decorate([
    (0, common_1.Post)('raffles/:id/draw'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('prizeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "executeDraw", null);
__decorate([
    (0, common_1.Get)('newsletter/campaigns'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "getNewsletterCampaigns", null);
__decorate([
    (0, common_1.Post)('newsletter/send'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OperatorController.prototype, "sendNewsletter", null);
exports.OperatorController = OperatorController = OperatorController_1 = __decorate([
    (0, common_1.Controller)('operator'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.operator, client_1.UserRole.admin])),
    __metadata("design:paramtypes", [operator_service_1.OperatorService])
], OperatorController);
//# sourceMappingURL=operator.controller.js.map