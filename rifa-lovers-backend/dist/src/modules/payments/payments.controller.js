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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const passport_1 = require("@nestjs/passport");
const flow_service_1 = require("./flow.service");
const purchases_service_1 = require("../purchases/purchases.service");
const users_service_1 = require("../users/users.service");
const resend_service_1 = require("../email/resend.service");
const decorators_1 = require("../../common/decorators");
const prisma_service_1 = require("../../database/prisma.service");
let PaymentsController = class PaymentsController {
    constructor(configService, flowService, purchasesService, usersService, resendService, prisma) {
        this.configService = configService;
        this.flowService = flowService;
        this.purchasesService = purchasesService;
        this.usersService = usersService;
        this.resendService = resendService;
        this.prisma = prisma;
    }
    async initiatePayment(userId, dto) {
        if (dto.idempotencyKey) {
            const existingTransaction = await this.prisma.paymentTransaction.findFirst({
                where: {
                    idempotencyKey: dto.idempotencyKey,
                    purchase: {
                        status: 'pending',
                    },
                },
            });
            if (existingTransaction) {
                throw new common_1.ConflictException('Ya existe un pago en proceso para esta solicitud');
            }
        }
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
        const updateResult = await this.prisma.paymentTransaction.updateMany({
            where: { purchaseId: purchase.id },
            data: {
                providerTransactionId: flowOrder.token,
                ...(dto.idempotencyKey && { idempotencyKey: dto.idempotencyKey }),
            },
        });
        if (updateResult.count === 0) {
            throw new common_1.BadRequestException('No se encontró la transacción de pago asociada a esta compra');
        }
        const paymentUrl = `${flowOrder.url}?token=${flowOrder.token}`;
        try {
            void this.resendService.sendPendingPaymentEmail({
                toEmail: user.email,
                toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
                purchaseId: purchase.id,
                raffleName: purchase.raffleName ?? null,
                amount: Number(purchase.totalAmount ?? 0),
            });
        }
        catch (err) {
        }
        return {
            purchaseId: purchase.id,
            flowOrderId: flowOrder.flowOrder.toString(),
            paymentUrl,
            token: flowOrder.token,
        };
    }
    async handleFlowReturn(token, res) {
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        if (token) {
            const purchase = await this.purchasesService.findByProviderTransactionId(token);
            if (!purchase) {
                const redirectUrl = `${frontendUrl}/payment/return?error=not_found`;
                res.setHeader('Content-Type', 'text/html');
                res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`);
                return;
            }
        }
        const redirectUrl = token
            ? `${frontendUrl}/payment/return?token=${token}`
            : `${frontendUrl}/payment/return`;
        res.setHeader('Content-Type', 'text/html');
        res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`);
    }
    async retryPayment(userId, purchaseId) {
        if (!purchaseId) {
            throw new common_1.NotFoundException('purchaseId requerido');
        }
        const purchase = await this.purchasesService.findById(purchaseId);
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        if (purchase.userId !== userId) {
            throw new common_1.BadRequestException('La compra no pertenece al usuario');
        }
        if (purchase.status !== 'pending') {
            throw new common_1.BadRequestException(`Solo se pueden reintentar compras pendientes. Estado actual: ${purchase.status}`);
        }
        const user = await this.usersService.findOne(userId);
        if (!user || !user.email) {
            throw new common_1.NotFoundException('Usuario no encontrado o sin email');
        }
        const backendUrl = this.configService.get('BACKEND_URL') || 'http://localhost:3000';
        const flowOrder = await this.flowService.createPaymentOrder(purchase.id, `Rifa Lovers - ${purchase.raffleName}`, purchase.totalAmount, user.email, `${backendUrl}/payments/return`, `${backendUrl}/webhooks/flow`);
        await this.prisma.paymentTransaction.updateMany({
            where: { purchaseId: purchase.id },
            data: { providerTransactionId: flowOrder.token, idempotencyKey: null },
        });
        const paymentUrl = `${flowOrder.url}?token=${flowOrder.token}`;
        return {
            purchaseId: purchase.id,
            flowOrderId: flowOrder.flowOrder.toString(),
            paymentUrl,
            token: flowOrder.token,
        };
    }
    async verifyFlowPaymentStatus(token) {
        if (!token) {
            throw new common_1.NotFoundException('Token requerido');
        }
        const purchase = await this.purchasesService.findByProviderTransactionId(token);
        if (!purchase) {
            throw new common_1.NotFoundException('Compra no encontrada');
        }
        const MAX_RETRIES = 5;
        const RETRY_DELAY_MS = 3000;
        let finalStatus = 1;
        let flowOrderId = 0;
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            const paymentStatus = await this.flowService.getPaymentStatus(token);
            finalStatus = paymentStatus.status;
            flowOrderId = paymentStatus.flowOrder;
            if (finalStatus !== 1) {
                break;
            }
            if (attempt < MAX_RETRIES - 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
            }
        }
        const currentPurchase = await this.purchasesService.findById(purchase.id);
        if (finalStatus === 2) {
            if (currentPurchase.status !== 'paid') {
                try {
                    await this.purchasesService.confirmPayment(purchase.id, {
                        providerTransactionId: String(flowOrderId),
                        provider: 'flow',
                        status: 'paid',
                    });
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                }
            }
        }
        if (finalStatus === 3 || finalStatus === 4) {
            if (currentPurchase.status === 'pending') {
                await this.purchasesService.updateStatus(purchase.id, 'failed');
            }
        }
        const updatedPurchase = await this.purchasesService.findById(purchase.id);
        return {
            flowStatus: finalStatus,
            purchaseStatus: updatedPurchase.status,
            purchaseId: purchase.id,
        };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('initiate'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    (0, decorators_1.Idempotent)(),
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
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleFlowReturn", null);
__decorate([
    (0, common_1.Post)('retry'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, throttler_1.Throttle)({ default: { limit: 10, ttl: 60000 } }),
    __param(0, (0, decorators_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('purchaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "retryPayment", null);
__decorate([
    (0, common_1.Post)('verify-flow-status'),
    (0, throttler_1.Throttle)({ default: { limit: 20, ttl: 60000 } }),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "verifyFlowPaymentStatus", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        flow_service_1.FlowService,
        purchases_service_1.PurchasesService,
        users_service_1.UsersService,
        resend_service_1.ResendService,
        prisma_service_1.PrismaService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map