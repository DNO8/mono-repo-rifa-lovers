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
exports.LuckyPassController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const lucky_pass_service_1 = require("./lucky-pass.service");
const decorators_1 = require("../../common/decorators");
let LuckyPassController = class LuckyPassController {
    constructor(luckyPassService) {
        this.luckyPassService = luckyPassService;
    }
    async getMyPasses(userId) {
        return this.luckyPassService.findByUser(userId);
    }
    async getMySummary(userId) {
        return this.luckyPassService.getSummary(userId);
    }
    async checkAvailability(raffleId, ticketNumber) {
        return this.luckyPassService.checkAvailability(raffleId, ticketNumber);
    }
};
exports.LuckyPassController = LuckyPassController;
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LuckyPassController.prototype, "getMyPasses", null);
__decorate([
    (0, common_1.Get)('my/summary'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LuckyPassController.prototype, "getMySummary", null);
__decorate([
    (0, common_1.Get)('check-availability'),
    __param(0, (0, common_1.Query)('raffleId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Query)('ticketNumber', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], LuckyPassController.prototype, "checkAvailability", null);
exports.LuckyPassController = LuckyPassController = __decorate([
    (0, common_1.Controller)('lucky-passes'),
    __metadata("design:paramtypes", [lucky_pass_service_1.LuckyPassService])
], LuckyPassController);
//# sourceMappingURL=lucky-pass.controller.js.map