"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var FlowService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = __importStar(require("crypto"));
let FlowService = FlowService_1 = class FlowService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(FlowService_1.name);
        this.apiKey = this.configService.get('FLOW_API_KEY') || '';
        this.secretKey = this.configService.get('FLOW_SECRET_KEY') || '';
        this.baseUrl = this.configService.get('FLOW_BASE_URL') || 'https://sandbox.flow.cl/api';
    }
    async createPaymentOrder(commerceOrder, subject, amount, email, returnUrl, confirmationUrl) {
        this.logger.debug(`Creando orden de pago Flow: ${commerceOrder}, $${amount}`);
        const params = {
            apiKey: this.apiKey,
            commerceOrder,
            subject,
            currency: 'CLP',
            amount: Math.round(amount),
            email,
            urlConfirmation: confirmationUrl,
            urlReturn: returnUrl,
        };
        const signature = this.generateSignature(params);
        this.logger.debug(`Flow API Key: ${this.apiKey.substring(0, 10)}...`);
        this.logger.debug(`Flow Base URL: ${this.baseUrl}`);
        this.logger.debug(`Signature: ${signature.substring(0, 20)}...`);
        const body = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            body.append(key, String(value));
        }
        body.append('s', signature);
        this.logger.debug(`Request body: ${body.toString().substring(0, 100)}...`);
        try {
            this.logger.debug(`Sending request to: ${this.baseUrl}/payment/create`);
            const response = await fetch(`${this.baseUrl}/payment/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: body.toString(),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Flow API error: ${response.status} - ${errorText}`);
            }
            const data = (await response.json());
            this.logger.log(`Orden Flow creada: ${data.flowOrder}, token: ${data.token}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error creando orden Flow: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    async getPaymentStatus(token) {
        this.logger.debug(`Consultando estado de pago: ${token}`);
        const params = { apiKey: this.apiKey, token };
        const signature = this.generateSignature(params);
        const url = new URL(`${this.baseUrl}/payment/getStatus`);
        url.searchParams.append('apiKey', this.apiKey);
        url.searchParams.append('token', token);
        url.searchParams.append('s', signature);
        try {
            const response = await fetch(url.toString());
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Flow API error: ${response.status} - ${errorText}`);
            }
            const data = (await response.json());
            this.logger.debug(`Flow payment status: order=${data.commerceOrder}, status=${data.status}`);
            return data;
        }
        catch (error) {
            this.logger.error(`Error consultando estado Flow: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    generateSignature(params) {
        const sortedKeys = Object.keys(params).sort();
        let toSign = '';
        for (const key of sortedKeys) {
            toSign += key + params[key];
        }
        return crypto.createHmac('sha256', this.secretKey).update(toSign).digest('hex');
    }
};
exports.FlowService = FlowService;
exports.FlowService = FlowService = FlowService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FlowService);
//# sourceMappingURL=flow.service.js.map