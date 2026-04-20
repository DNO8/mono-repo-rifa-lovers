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
var TicketReservationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketReservationsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const throttler_1 = require("@nestjs/throttler");
const ticket_reservations_service_1 = require("./ticket-reservations.service");
const dto_1 = require("./dto");
const decorators_1 = require("../../common/decorators");
let TicketReservationsController = TicketReservationsController_1 = class TicketReservationsController {
    constructor(reservationsService) {
        this.reservationsService = reservationsService;
        this.logger = new common_1.Logger(TicketReservationsController_1.name);
    }
    async reserve(userId, dto) {
        return this.reservationsService.reserve(userId, dto.raffleId, dto.ticketNumbers, dto.purchaseId);
    }
    async getMine(userId) {
        return this.reservationsService.getActiveReservationsForUser(userId);
    }
    async getByPurchase(purchaseId) {
        return this.reservationsService.getActiveReservationsForPurchase(purchaseId);
    }
    async release(purchaseId) {
        await this.reservationsService.release(purchaseId);
        return { message: 'Reservas liberadas' };
    }
};
exports.TicketReservationsController = TicketReservationsController;
__decorate([
    (0, common_1.Post)(),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ReserveTicketsDto]),
    __metadata("design:returntype", Promise)
], TicketReservationsController.prototype, "reserve", null);
__decorate([
    (0, common_1.Get)('mine'),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketReservationsController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)('purchase/:purchaseId'),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketReservationsController.prototype, "getByPurchase", null);
__decorate([
    (0, common_1.Delete)(':purchaseId'),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, common_1.Param)('purchaseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TicketReservationsController.prototype, "release", null);
exports.TicketReservationsController = TicketReservationsController = TicketReservationsController_1 = __decorate([
    (0, common_1.Controller)('ticket-reservations'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [ticket_reservations_service_1.TicketReservationsService])
], TicketReservationsController);
//# sourceMappingURL=ticket-reservations.controller.js.map