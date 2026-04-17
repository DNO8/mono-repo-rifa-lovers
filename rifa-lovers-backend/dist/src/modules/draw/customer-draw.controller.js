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
var CustomerDrawController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerDrawController = void 0;
const common_1 = require("@nestjs/common");
const customer_draw_service_1 = require("./customer-draw.service");
const decorators_1 = require("../../common/decorators");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../users/guards/roles.guard");
const customer_ownership_guard_1 = require("../users/guards/customer-ownership.guard");
let CustomerDrawController = CustomerDrawController_1 = class CustomerDrawController {
    constructor(customerDrawService) {
        this.customerDrawService = customerDrawService;
        this.logger = new common_1.Logger(CustomerDrawController_1.name);
    }
    async checkDrawAvailability(raffleId, customerUserId) {
        this.logger.log(`Customer ${customerUserId} verificando disponibilidad de sorteo para raffle ${raffleId}`);
        return this.customerDrawService.checkCustomerDrawAvailability(raffleId, customerUserId);
    }
    async executeDraw(raffleId, customerUserId) {
        this.logger.log(`Customer ${customerUserId} ejecutando sorteo para raffle ${raffleId}`);
        return this.customerDrawService.executeCustomerDraw(raffleId, customerUserId);
    }
};
exports.CustomerDrawController = CustomerDrawController;
__decorate([
    (0, common_1.Get)(':raffleId/check'),
    __param(0, (0, common_1.Param)('raffleId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerDrawController.prototype, "checkDrawAvailability", null);
__decorate([
    (0, common_1.Post)(':raffleId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('raffleId')),
    __param(1, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CustomerDrawController.prototype, "executeDraw", null);
exports.CustomerDrawController = CustomerDrawController = CustomerDrawController_1 = __decorate([
    (0, common_1.Controller)('customer/draw'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), new roles_guard_1.RolesGuard(['customer']), customer_ownership_guard_1.CustomerOwnershipGuard),
    __metadata("design:paramtypes", [customer_draw_service_1.CustomerDrawService])
], CustomerDrawController);
//# sourceMappingURL=customer-draw.controller.js.map