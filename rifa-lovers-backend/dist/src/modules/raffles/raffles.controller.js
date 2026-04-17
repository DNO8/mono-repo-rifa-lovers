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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesController = void 0;
const common_1 = require("@nestjs/common");
const raffles_service_1 = require("./raffles.service");
const customer_ownership_guard_1 = require("../users/guards/customer-ownership.guard");
const passport_1 = require("@nestjs/passport");
let RafflesController = class RafflesController {
    constructor(rafflesService) {
        this.rafflesService = rafflesService;
    }
    async getActive() {
        const raffle = await this.rafflesService.findActive();
        if (!raffle) {
            throw new common_1.NotFoundException('No hay rifa activa');
        }
        return raffle;
    }
    async getActiveProgress() {
        return this.rafflesService.getActiveProgress();
    }
    async getUserRaffles() {
        return await this.rafflesService.getUserRaffles();
    }
    async getCustomerRaffle(id) {
        return await this.rafflesService.findById(id);
    }
};
exports.RafflesController = RafflesController;
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getActive", null);
__decorate([
    (0, common_1.Get)('active/progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getActiveProgress", null);
__decorate([
    (0, common_1.Get)('user'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), customer_ownership_guard_1.CustomerOwnershipGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getUserRaffles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), customer_ownership_guard_1.CustomerOwnershipGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RafflesController.prototype, "getCustomerRaffle", null);
exports.RafflesController = RafflesController = __decorate([
    (0, common_1.Controller)('raffles'),
    __metadata("design:paramtypes", [raffles_service_1.RafflesService])
], RafflesController);
//# sourceMappingURL=raffles.controller.js.map