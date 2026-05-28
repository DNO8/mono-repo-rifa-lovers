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
var ContactController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const contact_service_1 = require("./contact.service");
const recaptcha_service_1 = require("../../common/services/recaptcha.service");
const contact_form_dto_1 = require("./dto/contact-form.dto");
const decorators_1 = require("../../common/decorators");
let ContactController = ContactController_1 = class ContactController {
    constructor(contactService, recaptchaService) {
        this.contactService = contactService;
        this.recaptchaService = recaptchaService;
        this.logger = new common_1.Logger(ContactController_1.name);
    }
    async submitContactForm(dto) {
        this.logger.log(`Contact form received: name="${dto.name}" email="${dto.email}" messageLength=${dto.message?.length}`);
        if (dto.recaptchaToken) {
            const isHuman = await this.recaptchaService.verify(dto.recaptchaToken);
            if (!isHuman) {
                throw new common_1.BadRequestException('Verificación reCAPTCHA fallida. Intenta de nuevo.');
            }
        }
        await this.contactService.submitContactForm(dto);
        return { message: 'Mensaje enviado exitosamente' };
    }
};
exports.ContactController = ContactController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, throttler_1.Throttle)({ default: { limit: 5, ttl: 300000 } }),
    (0, decorators_1.Idempotent)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [contact_form_dto_1.ContactFormDto]),
    __metadata("design:returntype", Promise)
], ContactController.prototype, "submitContactForm", null);
exports.ContactController = ContactController = ContactController_1 = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [contact_service_1.ContactService,
        recaptcha_service_1.RecaptchaService])
], ContactController);
//# sourceMappingURL=contact.controller.js.map