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
var RecaptchaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecaptchaService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RecaptchaService = RecaptchaService_1 = class RecaptchaService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(RecaptchaService_1.name);
    }
    async verify(token) {
        const secretKey = this.config.get('RECAPTCHA_SECRET_KEY');
        if (!secretKey) {
            this.logger.warn('RECAPTCHA_SECRET_KEY no está configurada. Saltando validación (solo en desarrollo).');
            return true;
        }
        try {
            const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    secret: secretKey,
                    response: token,
                }).toString(),
            });
            const data = (await response.json());
            if (!data.success) {
                this.logger.warn(`reCAPTCHA falló: ${data['error-codes']?.join(', ') || 'sin detalles'}`);
            }
            return data.success === true;
        }
        catch (error) {
            this.logger.error('Error verificando reCAPTCHA:', error instanceof Error ? error.message : String(error));
            return false;
        }
    }
};
exports.RecaptchaService = RecaptchaService;
exports.RecaptchaService = RecaptchaService = RecaptchaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RecaptchaService);
//# sourceMappingURL=recaptcha.service.js.map