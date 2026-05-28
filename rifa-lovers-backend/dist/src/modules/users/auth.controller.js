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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const supabase_service_1 = require("../../config/supabase.service");
const config_1 = require("@nestjs/config");
const recaptcha_service_1 = require("../../common/services/recaptcha.service");
const decorators_1 = require("../../common/decorators");
let AuthController = class AuthController {
    constructor(authService, supabaseService, config, recaptchaService) {
        this.authService = authService;
        this.supabaseService = supabaseService;
        this.config = config;
        this.recaptchaService = recaptchaService;
    }
    async register(registerDto) {
        if (!registerDto.acceptTerms) {
            throw new common_1.BadRequestException('Debes aceptar los Términos y Condiciones para registrarte.');
        }
        const isHuman = await this.recaptchaService.verify(registerDto.recaptchaToken);
        if (!isHuman) {
            throw new common_1.BadRequestException('Verificación reCAPTCHA fallida. Intenta de nuevo.');
        }
        return this.authService.register(registerDto);
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async refreshToken(refreshToken) {
        return this.authService.refreshToken(refreshToken);
    }
    async confirmEmail(token, type, email, res) {
        const frontendUrl = this.config.get('FRONTEND_URL') ?? 'http://localhost:5173';
        if (!token || !email) {
            res.redirect(`${frontendUrl}/auth/error?reason=missing_params`);
            return;
        }
        try {
            const { error } = await this.supabaseService.verifyOTP(email, token, type);
            if (error) {
                res.redirect(`${frontendUrl}/auth/error?reason=invalid_token`);
                return;
            }
            const redirectPath = type === 'recovery' ? '/auth/reset-password' : '/login?verified=true';
            res.redirect(`${frontendUrl}${redirectPath}`);
        }
        catch {
            res.redirect(`${frontendUrl}/auth/error?reason=verification_failed`);
        }
    }
    async resendConfirmation(email) {
        const frontendUrl = this.config.get('FRONTEND_URL') ?? 'http://localhost:5173';
        const redirectUrl = `${frontendUrl}/auth/confirm`;
        const { error } = await this.supabaseService.resendConfirmationEmail(email, redirectUrl);
        if (error) {
            return { message: 'Error al reenviar el email. Intenta más tarde.' };
        }
        return { message: 'Email de confirmación reenviado. Revisa tu bandeja de entrada.' };
    }
    async forgotPassword(email) {
        const frontendUrl = this.config.get('FRONTEND_URL') ?? 'http://localhost:5173';
        const redirectUrl = `${frontendUrl}/auth/confirm`;
        const { error } = await this.supabaseService.sendPasswordResetEmail(email, redirectUrl);
        if (error) {
            return { message: 'Error al enviar el email. Intenta más tarde.' };
        }
        return { message: 'Email de recuperación enviado. Revisa tu bandeja de entrada.' };
    }
    async resetPassword(token, email, password) {
        if (!token || !email || !password) {
            return { success: false, message: 'Token, email y contraseña son requeridos.' };
        }
        let userId;
        const { data: userData, error: userError } = await this.supabaseService.getUser(token);
        if (userData?.user) {
            userId = userData.user.id;
        }
        else if (userError) {
        }
        if (!userId) {
            const { data: verifyData, error: verifyError } = await this.supabaseService.verifyOTP(email, token, 'recovery');
            if (verifyError || !verifyData?.user) {
                return { success: false, message: 'Token inválido o expirado.' };
            }
            userId = verifyData.user.id;
        }
        const { error: updateError } = await this.supabaseService.updateUser(userId, { password });
        if (updateError) {
            return { success: false, message: 'Error al actualizar la contraseña. Intenta de nuevo.' };
        }
        return { success: true, message: 'Contraseña actualizada exitosamente.' };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, decorators_1.Idempotent)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, throttler_1.Throttle)({ auth: { limit: 10, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('refreshToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Get)('confirm'),
    __param(0, (0, common_1.Query)('token')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('email')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "confirmEmail", null);
__decorate([
    (0, common_1.Post)('resend-confirmation'),
    (0, throttler_1.Throttle)({ auth: { limit: 3, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendConfirmation", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, throttler_1.Throttle)({ auth: { limit: 3, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, throttler_1.Throttle)({ auth: { limit: 5, ttl: 900000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)('token')),
    __param(1, (0, common_1.Body)('email')),
    __param(2, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        supabase_service_1.SupabaseService,
        config_1.ConfigService,
        recaptcha_service_1.RecaptchaService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map