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
var PaymentsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const flow_service_1 = require("./flow.service");
const purchases_service_1 = require("../purchases/purchases.service");
const users_service_1 = require("../users/users.service");
const decorators_1 = require("../../common/decorators");
const prisma_service_1 = require("../../database/prisma.service");
let PaymentsController = PaymentsController_1 = class PaymentsController {
    constructor(configService, flowService, purchasesService, usersService, prisma) {
        this.configService = configService;
        this.flowService = flowService;
        this.purchasesService = purchasesService;
        this.usersService = usersService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(PaymentsController_1.name);
    }
    async initiatePayment(userId, dto) {
        this.logger.debug(`Iniciando pago para purchase: ${dto.purchaseId}, user: ${userId}`);
        const purchase = await this.purchasesService.findById(dto.purchaseId);
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        const user = await this.usersService.findOne(userId);
        if (!user || !user.email) {
            throw new common_1.NotFoundException('Usuario no encontrado o sin email');
        }
        const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
        const flowOrder = await this.flowService.createPaymentOrder(purchase.id, `Rifa Lovers - ${purchase.raffleName}`, purchase.totalAmount, user.email, `${backendUrl}/payments/return`, `${backendUrl}/webhooks/flow`);
        this.logger.log(`Pago iniciado: purchase=${purchase.id}, flowOrder=${flowOrder.flowOrder}`);
        await this.prisma.paymentTransaction.create({
            data: {
                purchaseId: purchase.id,
                provider: 'flow',
                providerTransactionId: flowOrder.token,
                amount: purchase.totalAmount,
                status: 'created',
            },
        });
        this.logger.debug(`PaymentTransaction creada con token: ${flowOrder.token}`);
        return {
            purchaseId: purchase.id,
            flowOrderId: flowOrder.flowOrder.toString(),
            paymentUrl: `${flowOrder.url}?token=${flowOrder.token}`,
            token: flowOrder.token,
        };
    }
    handleFlowReturn(token, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        this.logger.debug(`Flow return recibido con token: ${token}`);
        const redirectUrl = token
            ? `${frontendUrl}/payment/return?token=${token}`
            : `${frontendUrl}/payment/return`;
        res.setHeader('Content-Type', 'text/html');
        res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('return'),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "handleFlowReturn", null);
exports.PaymentsController = PaymentsController = PaymentsController_1 = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        flow_service_1.FlowService,
        purchases_service_1.PurchasesService,
        users_service_1.UsersService,
        prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map