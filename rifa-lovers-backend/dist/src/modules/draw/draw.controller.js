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
var DrawController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DrawController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const passport_1 = require("@nestjs/passport");
const client_1 = require("@prisma/client");
const draw_service_1 = require("./draw.service");
const decorators_1 = require("../../common/decorators");
const roles_guard_1 = require("../users/guards/roles.guard");
let DrawController = DrawController_1 = class DrawController {
    constructor(drawService) {
        this.drawService = drawService;
        this.logger = new common_1.Logger(DrawController_1.name);
    }
    async executeDraw(raffleId, adminUserId) {
        this.logger.log(`Admin ${adminUserId} ejecutando sorteo para rifa ${raffleId}`);
        return this.drawService.executeDraw(raffleId, adminUserId);
    }
    async checkDrawAvailability(raffleId) {
        return this.drawService.canExecuteDraw(raffleId);
    }
    async getDrawResults(raffleId) {
        const results = await this.drawService.getDrawResults(raffleId);
        if (!results) {
            return { message: 'El sorteo aún no se ha ejecutado para esta rifa' };
        }
        return results;
    }
    async getDrawResultsAlt(raffleId) {
        return this.getDrawResults(raffleId);
    }
};
exports.DrawController = DrawController;
__decorate([
    (0, common_1.Post)('admin/raffles/:id/draw'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    (0, throttler_1.Throttle)({ admin: { limit: 5, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "executeDraw", null);
__decorate([
    (0, common_1.Get)('admin/raffles/:id/draw/check'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard([client_1.UserRole.admin, client_1.UserRole.operator])),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "checkDrawAvailability", null);
__decorate([
    (0, common_1.Get)('raffles/:id/winners'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "getDrawResults", null);
__decorate([
    (0, common_1.Get)('raffles/:id/draw/results'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DrawController.prototype, "getDrawResultsAlt", null);
exports.DrawController = DrawController = DrawController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [draw_service_1.DrawService])
], DrawController);
//# sourceMappingURL=draw.controller.js.map