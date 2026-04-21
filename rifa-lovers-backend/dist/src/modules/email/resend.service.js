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
var ResendService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResendService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let ResendService = ResendService_1 = class ResendService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(ResendService_1.name);
        this.resend = null;
        const apiKey = this.config.get('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new resend_1.Resend(apiKey);
            this.logger.log('Resend SDK inicializado');
        }
        else {
            this.logger.warn('RESEND_API_KEY no configurada — emails deshabilitados');
        }
    }
    getFromEmail(type) {
        const fromNoreply = this.config.get('EMAIL_FROM_NOREPLY') ?? 'noreply@rifalovers.cl';
        const fromContact = this.config.get('EMAIL_FROM_CONTACT') ?? 'contacto@rifalovers.cl';
        return type === 'noreply' ? fromNoreply : fromContact;
    }
    async sendWinnerEmail(data) {
        if (!this.resend) {
            this.logger.warn(`[EMAIL SKIP] Ganador: ${data.toEmail} — ${data.prizeName}`);
            return;
        }
        const from = this.getFromEmail('noreply');
        const firstName = data.toName.split(' ')[0] || 'Ganador';
        const raffle = data.raffleName ?? 'RifaLovers';
        const html = this.buildWinnerEmailTemplate({
            firstName,
            prizeName: data.prizeName,
            passNumber: data.passNumber,
            raffle,
            frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
        });
        try {
            const { error } = await this.resend.emails.send({
                from: `RifaLovers <${from}>`,
                to: data.toEmail,
                subject: `🏆 ¡Ganaste ${data.prizeName} en ${raffle}!`,
                html,
            });
            if (error) {
                this.logger.error(`Error enviando email a ${data.toEmail}: ${error.message}`);
                return;
            }
            this.logger.log(`Email ganador enviado a ${data.toEmail}`);
        }
        catch (err) {
            this.logger.error(`Error enviando email a ${data.toEmail}: ${err}`);
        }
    }
    async sendContactFormToAdmin(data) {
        if (!this.resend) {
            this.logger.warn(`[EMAIL SKIP] Contacto de ${data.email} — ${data.name}`);
            return;
        }
        const from = this.getFromEmail('contact');
        const to = this.config.get('EMAIL_TO_CONTACT') ?? 'contacto@rifalovers.cl';
        const html = this.buildContactFormTemplate({
            name: data.name,
            email: data.email,
            message: data.message,
        });
        try {
            const { error } = await this.resend.emails.send({
                from: `RifaLovers Contacto <${from}>`,
                to,
                subject: `📩 Nuevo mensaje de contacto de ${data.name}`,
                replyTo: data.email,
                html,
            });
            if (error) {
                this.logger.error(`Error enviando contacto: ${error.message}`);
                return;
            }
            this.logger.log(`Email de contacto enviado — ${data.email}`);
        }
        catch (err) {
            this.logger.error(`Error enviando contacto: ${err}`);
        }
    }
    async sendContactConfirmationToUser(data) {
        if (!this.resend) {
            this.logger.warn(`[EMAIL SKIP] Confirmación a ${data.email}`);
            return;
        }
        const from = this.getFromEmail('contact');
        const html = this.buildContactConfirmationTemplate({
            name: data.name,
            message: data.message,
        });
        try {
            const { error } = await this.resend.emails.send({
                from: `RifaLovers <${from}>`,
                to: data.email,
                subject: `📬 Hemos recibido tu mensaje`,
                html,
            });
            if (error) {
                this.logger.error(`Error enviando confirmación: ${error.message}`);
                return;
            }
            this.logger.log(`Confirmación enviada a ${data.email}`);
        }
        catch (err) {
            this.logger.error(`Error enviando confirmación: ${err}`);
        }
    }
    buildWinnerEmailTemplate(params) {
        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>¡Ganaste!</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">🏆</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">¡Felicitaciones, ${params.firstName}!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu LuckyPass fue seleccionado en el sorteo</p>
    </div>
    <div style="padding:32px;">
      <div style="background:#f9f5ff;border:2px solid #ede9fe;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Premio ganado</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#7c3aed;">${params.prizeName}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">LuckyPass #${String(params.passNumber).padStart(5, '0')} · ${params.raffle}</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">El equipo de RifaLovers se pondrá en contacto contigo a la brevedad para coordinar la entrega de tu premio. Asegúrate de tener tus datos de contacto actualizados.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="${params.frontendUrl}/dashboard" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Ver en mi cuenta
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:hola@rifalovers.cl" style="color:#7c3aed;">hola@rifalovers.cl</a></p>
    </div>
  </div>
</body>
</html>`;
    }
    buildContactFormTemplate(params) {
        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Nuevo mensaje de contacto</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">📩 Nuevo mensaje de contacto</h1>
    </div>
    <div style="padding:32px;">
      <div style="margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">De</p>
        <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">${params.name}</p>
        <p style="margin:4px 0 0;font-size:14px;color:#6b7280;">${params.email}</p>
      </div>
      <div style="background:#f9f5ff;border:2px solid #ede9fe;border-radius:12px;padding:20px;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Mensaje</p>
        <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;white-space:pre-wrap;">${params.message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
      </div>
      <div style="margin-top:24px;text-align:center;">
        <a href="mailto:${params.email}" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Responder
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;
    }
    buildContactConfirmationTemplate(params) {
        return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Mensaje recibido</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📬</div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:800;">¡Gracias por contactarnos!</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;line-height:1.6;font-size:15px;">Hola ${params.name.split(' ')[0]},</p>
      <p style="color:#374151;line-height:1.6;font-size:15px;">Hemos recibido tu mensaje y te responderemos en menos de 24 horas.</p>
      <div style="background:#f9f5ff;border:2px solid #ede9fe;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Tu mensaje</p>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;white-space:pre-wrap;">${params.message.substring(0, 200).replace(/</g, '&lt;').replace(/>/g, '&gt;')}${params.message.length > 200 ? '...' : ''}</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">Si necesitas ayuda urgente, puedes escribirnos directamente a <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a></p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile</p>
    </div>
  </div>
</body>
</html>`;
    }
};
exports.ResendService = ResendService;
exports.ResendService = ResendService = ResendService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ResendService);
//# sourceMappingURL=resend.service.js.map