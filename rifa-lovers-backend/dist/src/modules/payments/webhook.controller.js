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
var WebhookController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const flow_service_1 = require("./flow.service");
const purchases_service_1 = require("../purchases/purchases.service");
let WebhookController = WebhookController_1 = class WebhookController {
    constructor(configService, flowService, purchasesService) {
        this.configService = configService;
        this.flowService = flowService;
        this.purchasesService = purchasesService;
        this.logger = new common_1.Logger(WebhookController_1.name);
    }
    async handleFlowWebhook(token) {
        this.logger.debug(`Recibido webhook de Flow con token: ${token}`);
        if (!token) {
            this.logger.error('Webhook recibido sin token');
            throw new common_1.BadRequestException('Token requerido');
        }
        const paymentStatus = await this.flowService.getPaymentStatus(token);
        const { commerceOrder, status, amount } = paymentStatus;
        this.logger.log(`Flow payment status: order=${commerceOrder}, status=${status}, amount=${amount}`);
        const purchase = await this.purchasesService.findByFlowToken(token);
        if (!purchase) {
            this.logger.error(`No se encontró compra con flowToken: ${token}`);
            throw new common_1.BadRequestException('Compra no encontrada');
        }
        switch (status) {
            case 2: {
                try {
                    await this.purchasesService.confirmPayment(purchase.id, {
                        providerTransactionId: String(paymentStatus.flowOrder),
                        provider: 'flow',
                        status: 'paid',
                    });
                    this.logger.log(`Pago confirmado para compra: ${purchase.id}`);
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    const stack = err instanceof Error ? err.stack : undefined;
                    this.logger.error(`ERROR en confirmPayment para ${purchase.id}: ${msg}`, stack);
                }
                break;
            }
            case 3:
            case 4: {
                await this.purchasesService.updateStatus(purchase.id, 'failed');
                this.logger.log(`Pago rechazado/anulado para compra: ${purchase.id}`);
                break;
            }
            default: {
                this.logger.warn(`Estado de pago no procesable: ${status} para orden ${purchase.id}`);
            }
        }
        return { message: 'Webhook procesado' };
    }
    async triggerDev(token) {
        if (this.configService.get('NODE_ENV') === 'production') {
            throw new common_1.BadRequestException('No disponible en producción');
        }
        if (!token) {
            throw new common_1.BadRequestException('Token requerido');
        }
        this.logger.warn(`[DEV] Trigger manual de webhook con token: ${token}`);
        return this.handleFlowWebhook(token);
    }
};
exports.WebhookController = WebhookController;
__decorate([
    (0, common_1.Post)('flow'),
    (0, common_1.HttpCode)(200),
    (0, throttler_1.Throttle)({ default: { limit: 60, ttl: 60000 } }),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "handleFlowWebhook", null);
__decorate([
    (0, common_1.Post)('flow/trigger-dev'),
    (0, throttler_1.SkipThrottle)(),
    __param(0, (0, common_1.Body)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WebhookController.prototype, "triggerDev", null);
exports.WebhookController = WebhookController = WebhookController_1 = __decorate([
    (0, common_1.Controller)('webhooks'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        flow_service_1.FlowService,
        purchases_service_1.PurchasesService])
], WebhookController);
//# sourceMappingURL=webhook.controller.js.map