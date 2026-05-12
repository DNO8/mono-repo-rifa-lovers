import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Resend } from 'resend'

export interface WinnerEmailData {
  toEmail: string
  toName: string
  prizeName: string
  passNumber: number
  raffleName: string | null
}

export interface ContactFormData {
  name: string
  email: string
  message: string
}

export interface NewsletterEmailData {
  toEmail: string
  toName?: string
  subject: string
  bodyHtml: string
}

export interface PurchaseConfirmationData {
  toEmail: string
  toName: string
  purchaseId: string
  raffleName: string
  packName: string
  quantity: number
  totalAmount: number
  luckyPassCount: number
  ticketNumbers: number[]
}

export interface FailedPaymentData {
  toEmail: string
  toName: string
  purchaseId: string
  raffleName: string | null
  amount: number
}

export interface IncompletePaymentData {
  toEmail: string
  toName: string
  purchaseId: string
  raffleName: string | null
  amount: number
}

export interface PendingPaymentData {
  toEmail: string
  toName: string
  purchaseId: string
  raffleName: string | null
  amount: number
  paymentUrl: string
}

export interface PromotedRoleData {
  toEmail: string
  toName: string
  role: string
  frontendUrl: string
}

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name)
  private readonly resend: Resend | null = null

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('RESEND_API_KEY')
    if (apiKey) {
      this.resend = new Resend(apiKey)
      this.logger.log('Resend SDK inicializado')
    } else {
      this.logger.warn('RESEND_API_KEY no configurada — emails deshabilitados')
    }
  }

  private getFromEmail(type: 'noreply' | 'contact'): string {
    const fromNoreply = this.config.get<string>('EMAIL_FROM_NOREPLY') ?? 'noreply@rifalovers.cl'
    const fromContact = this.config.get<string>('EMAIL_FROM_CONTACT') ?? 'contacto@rifalovers.cl'
    return type === 'noreply' ? fromNoreply : fromContact
  }

  async sendWinnerEmail(data: WinnerEmailData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Ganador: ${data.toEmail} — ${data.prizeName}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const firstName = data.toName.split(' ')[0] || 'Ganador'
    const raffle = data.raffleName ?? 'RifaLovers'

    const html = this.buildWinnerEmailTemplate({
      firstName,
      prizeName: data.prizeName,
      passNumber: data.passNumber,
      raffle,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `🏆 ¡Ganaste ${data.prizeName} en ${raffle}!`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando email a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Email ganador enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email a ${data.toEmail}: ${err}`)
    }
  }

  async sendContactFormToAdmin(data: ContactFormData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Contacto de ${data.email} — ${data.name}`)
      return
    }

    const from = this.getFromEmail('contact')
    const to = this.config.get<string>('EMAIL_TO_CONTACT') ?? 'contacto@rifalovers.cl'

    const html = this.buildContactFormTemplate({
      name: data.name,
      email: data.email,
      message: data.message,
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers Contacto <${from}>`,
        to,
        subject: `📩 Nuevo mensaje de contacto de ${data.name}`,
        replyTo: data.email,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando contacto: ${error.message}`)
        return
      }

      this.logger.log(`Email de contacto enviado — ${data.email}`)
    } catch (err) {
      this.logger.error(`Error enviando contacto: ${err}`)
    }
  }

  async sendContactConfirmationToUser(data: ContactFormData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Confirmación a ${data.email}`)
      return
    }

    const from = this.getFromEmail('contact')

    const html = this.buildContactConfirmationTemplate({
      name: data.name,
      message: data.message,
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.email,
        subject: `📬 Hemos recibido tu mensaje`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando confirmación: ${error.message}`)
        return
      }

      this.logger.log(`Confirmación enviada a ${data.email}`)
    } catch (err) {
      this.logger.error(`Error enviando confirmación: ${err}`)
    }
  }

  async sendPurchaseConfirmation(data: PurchaseConfirmationData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Compra confirmada: ${data.toEmail} — ${data.purchaseId}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const firstName = data.toName.split(' ')[0] || 'Comprador'

    const html = this.buildPurchaseConfirmationTemplate({
      firstName,
      raffleName: data.raffleName,
      packName: data.packName,
      quantity: data.quantity,
      totalAmount: data.totalAmount,
      luckyPassCount: data.luckyPassCount,
      ticketNumbers: data.ticketNumbers,
      purchaseId: data.purchaseId,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `✅ Compra confirmada - ${data.raffleName}`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando confirmación de compra a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Confirmación de compra enviada a ${data.toEmail} — ${data.purchaseId}`)
    } catch (err) {
      this.logger.error(`Error enviando confirmación de compra a ${data.toEmail}: ${err}`)
    }
  }

  private buildPurchaseConfirmationTemplate(params: {
    firstName: string
    raffleName: string
    packName: string
    quantity: number
    totalAmount: number
    luckyPassCount: number
    ticketNumbers: number[]
    purchaseId: string
    frontendUrl: string
  }): string {
    const ticketList = params.ticketNumbers
      .map((n) => `<span style="display:inline-block;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;padding:6px 12px;margin:4px;font-size:14px;font-weight:600;color:#111827;">#${String(n).padStart(5, '0')}</span>`)
      .join('')

    const formattedAmount = params.totalAmount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    })

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Compra confirmada - RifaLovers</title>
</head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#ffffff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <!-- Card Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
          <!-- Logo Header -->
          <tr>
            <td align="center" style="padding:40px 32px 24px;border-bottom:1px solid #f3f4f6;">
              <div style="font-size:48px;margin-bottom:8px;">
              <img src="https://www.rifalovers.cl/images/logos/logov2.png" alt="RifaLovers" width="180" style="display:block;max-width:180px;height:auto;">
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;">
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#111827;text-align:center;">¡Compra confirmada, ${params.firstName}!</h1>
              <p style="margin:0 0 32px;font-size:16px;line-height:1.6;color:#374151;text-align:center;">Tu participación está lista en <span style="color:#7c3aed;font-weight:600;">${params.raffleName}</span></p>
              
              <!-- Order Summary Box -->
              <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:24px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                <p style="margin:0 0 4px;font-size:12px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Resumen de compra</p>
                <p style="margin:8px 0;font-size:18px;font-weight:700;color:#111827;">${params.quantity}x ${params.packName}</p>
                <p style="margin:0;font-size:16px;color:#7c3aed;font-weight:700;">${formattedAmount}</p>
              </div>
              
              <!-- LuckyPasses Section -->
              <div style="margin-bottom:24px;">
                <p style="margin:0 0 16px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Tus LuckyPasses <span style="color:#7c3aed;">(${params.luckyPassCount})</span></p>
                <div style="text-align:center;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;box-shadow:0 2px 8px rgba(0,0,0,0.04);">
                  ${ticketList}
                </div>
              </div>
              
              <p style="color:#374151;line-height:1.6;font-size:15px;margin-bottom:32px;text-align:center;">Guarda estos números, son tu <span style="color:#7c3aed;font-weight:600;">ticket para ganar</span>. ¡Mucha suerte en el sorteo!</p>
              
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:#7c3aed;box-shadow:0 4px 12px rgba(124,58,237,0.3);">
                    <a href="${params.frontendUrl}/dashboard" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;border-radius:10px;">Ver en mi cuenta</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 8px;">Orden: <span style="color:#7c3aed;">${params.purchaseId}</span> · <strong style="color:#111827;">RifaLovers</strong> · Chile</p>
              <p style="color:#9ca3af;font-size:11px;margin:0;">© 2026 RifaLovers. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }

  private buildWinnerEmailTemplate(params: {
    firstName: string
    prizeName: string
    passNumber: number
    raffle: string
    frontendUrl: string
  }): string {
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
</html>`
  }

  private buildContactFormTemplate(params: {
    name: string
    email: string
    message: string
  }): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Nuevo mensaje de contacto</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:32px;text-align:center;">
      <h1 style="color:#000;margin:0;font-size:24px;font-weight:800;">📩 Nuevo mensaje de contacto</h1>
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
</html>`
  }

  private buildContactConfirmationTemplate(params: {
    name: string
    message: string
  }): string {
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
</html>`
  }

  async sendFailedPaymentEmail(data: FailedPaymentData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Pago fallido: ${data.toEmail} — ${data.purchaseId}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const firstName = data.toName.split(' ')[0] || 'Participante'
    const raffle = data.raffleName ?? 'RifaLovers'
    const formattedAmount = data.amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    })

    const html = this.buildFailedPaymentTemplate({
      firstName,
      raffle,
      amount: formattedAmount,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `❌ Tu pago en ${raffle} no pudo ser procesado`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando email de pago fallido a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Email de pago fallido enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email de pago fallido a ${data.toEmail}: ${err}`)
    }
  }

  async sendIncompletePaymentEmail(data: IncompletePaymentData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Pago incompleto: ${data.toEmail} — ${data.purchaseId}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const firstName = data.toName.split(' ')[0] || 'Participante'
    const raffle = data.raffleName ?? 'RifaLovers'
    const formattedAmount = data.amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    })

    const html = this.buildIncompletePaymentTemplate({
      firstName,
      raffle,
      amount: formattedAmount,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `🕐 Tu compra en ${raffle} no fue completada`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando email de pago incompleto a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Email de pago incompleto enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email de pago incompleto a ${data.toEmail}: ${err}`)
    }
  }

  async sendPendingPaymentEmail(data: PendingPaymentData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Pago pendiente: ${data.toEmail} — ${data.purchaseId}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const firstName = data.toName.split(' ')[0] || 'Participante'
    const raffle = data.raffleName ?? 'RifaLovers'
    const formattedAmount = data.amount.toLocaleString('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    })

    const html = this.buildPendingPaymentTemplate({
      firstName,
      raffle,
      amount: formattedAmount,
      paymentUrl: data.paymentUrl,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `💳 Tu pago en ${raffle} está en proceso`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando email de pago pendiente a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Email de pago pendiente enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email de pago pendiente a ${data.toEmail}: ${err}`)
    }
  }

  private buildFailedPaymentTemplate(params: {
    firstName: string
    raffle: string
    amount: string
    frontendUrl: string
  }): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Pago no procesado</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#ef4444,#dc2626);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">❌</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Hola ${params.firstName}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu pago no pudo ser procesado</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;line-height:1.6;font-size:15px;">El pago para tu participación en <strong>${params.raffle}</strong> no fue aprobado por el procesador de pagos.</p>
      <div style="background:#fef2f2;border:2px solid #fee2e2;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Monto no cobrado</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#ef4444;">${params.amount}</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">Puedes intentar nuevamente con otro método de pago o contactarnos si necesitas ayuda.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="${params.frontendUrl}/checkout" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Intentar de nuevo
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a></p>
    </div>
  </div>
</body>
</html>`
  }

  private buildIncompletePaymentTemplate(params: {
    firstName: string
    raffle: string
    amount: string
    frontendUrl: string
  }): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Compra invalidada</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#6b7280,#4b5563);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">🕐</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Hola ${params.firstName}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu compra no fue completada</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;line-height:1.6;font-size:15px;">Iniciaste una participación en <strong>${params.raffle}</strong>, pero el pago no se completó dentro del tiempo establecido.</p>
      <div style="background:#f3f4f6;border:2px solid #e5e7eb;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Monto no cobrado</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#4b5563;">${params.amount}</p>
      </div>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:14px;color:#1e40af;line-height:1.5;"><strong>No debes hacer nada.</strong> Nosotros nos encargamos de invalidar tu compra automáticamente. No se realizó ningún cobro a tu tarjeta o cuenta.</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">Si deseas participar nuevamente, puedes crear una nueva compra en la plataforma cuando lo desees.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="${params.frontendUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Volver a la página principal
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a></p>
    </div>
  </div>
</body>
</html>`
  }

  private buildPendingPaymentTemplate(params: {
    firstName: string
    raffle: string
    amount: string
    paymentUrl: string
    frontendUrl: string
  }): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Pago en proceso</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#6d28d9);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">💳</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Hola ${params.firstName}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu pago está en proceso</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;line-height:1.6;font-size:15px;">Hemos recibido tu solicitud para participar en <strong>${params.raffle}</strong>. Tu pago está siendo procesado por Flow.</p>
      <div style="background:#ede9fe;border:2px solid #ddd6fe;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Monto a pagar</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#7c3aed;">${params.amount}</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">Te enviaremos un correo de confirmación cuando tu pago sea aprobado. Si no completaste el pago, puedes continuar ahora:</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="${params.paymentUrl}" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Continuar con el pago
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a></p>
    </div>
  </div>
</body>
</html>`
  }

  async sendNewsletterEmail(data: NewsletterEmailData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Newsletter a ${data.toEmail}: ${data.subject}`)
      return
    }

    const from = this.getFromEmail('noreply')
    const html = this.buildNewsletterEmailTemplate({
      subject: data.subject,
      bodyHtml: data.bodyHtml,
      toName: data.toName,
      frontendUrl: this.config.get('FRONTEND_URL') ?? 'https://rifalovers.cl',
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: data.subject,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando newsletter a ${data.toEmail}: ${error.message}`)
        throw new Error(error.message)
      }

      this.logger.log(`Newsletter enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando newsletter a ${data.toEmail}: ${err}`)
      throw err
    }
  }

  async sendPromotedRoleEmail(data: PromotedRoleData): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[EMAIL SKIP] Rol promovido: ${data.toEmail} — ${data.role}`)
      return
    }

    const from = this.getFromEmail('contact')
    const firstName = data.toName.split(' ')[0] || 'Usuario'
    const roleLabel = data.role === 'admin' ? 'Administrador' : 'Operador'

    const html = this.buildPromotedRoleTemplate({
      firstName,
      role: roleLabel,
      frontendUrl: data.frontendUrl,
    })

    try {
      const { error } = await this.resend.emails.send({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `🎉 Has sido promovido a ${roleLabel} en RifaLovers`,
        html,
      })

      if (error) {
        this.logger.error(`Error enviando email de rol promovido a ${data.toEmail}: ${error.message}`)
        return
      }

      this.logger.log(`Email de rol promovido enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email de rol promovido a ${data.toEmail}: ${err}`)
    }
  }

  private buildPromotedRoleTemplate(params: {
    firstName: string
    role: string
    frontendUrl: string
  }): string {
    return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Has sido promovido</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#a855f7);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">Hola ${params.firstName}</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:16px;">Ahora eres <strong>${params.role}</strong> en RifaLovers</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#374151;line-height:1.6;font-size:15px;margin:0 0 20px;">Tu cuenta ha sido actualizada con permisos avanzados. A continuación te explicamos paso a paso cómo sacarle el máximo provecho a la plataforma.</p>

      <div style="margin:24px 0;padding:20px;background:#f5f3ff;border-radius:12px;border-left:4px solid #7c3aed;">
        <h3 style="margin:0 0 8px;color:#7c3aed;font-size:16px;font-weight:700;">Paso 1: Accede al Panel de Control</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Inicia sesión y dirígete a la sección <strong>"Admin"</strong> en el menú principal. Ahí verás el dashboard con métricas en tiempo real: ventas totales, rifas activas y participaciones recientes.</p>
      </div>

      <div style="margin:24px 0;padding:20px;background:#f5f3ff;border-radius:12px;border-left:4px solid #a855f7;">
        <h3 style="margin:0 0 8px;color:#a855f7;font-size:16px;font-weight:700;">Paso 2: Crea tu Primera Rifa</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Haz clic en <strong>"Nueva Rifa"</strong>. Define un título atractivo, sube una imagen de portada, escribe una descripción clara y establece la <strong>fecha del sorteo</strong>. Recuerda: una buena imagen y descripción aumentan las ventas.</p>
      </div>

      <div style="margin:24px 0;padding:20px;background:#f5f3ff;border-radius:12px;border-left:4px solid #7c3aed;">
        <h3 style="margin:0 0 8px;color:#7c3aed;font-size:16px;font-weight:700;">Paso 3: Configura los Packs</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Dentro de la rifa, ve a <strong>"Packs"</strong> y crea diferentes opciones de precio. Por ejemplo: 1 número por $5.000, 5 números por $20.000, 10 números por $35.000. Más opciones = más ventas.</p>
      </div>

      <div style="margin:24px 0;padding:20px;background:#f5f3ff;border-radius:12px;border-left:4px solid #a855f7;">
        <h3 style="margin:0 0 8px;color:#a855f7;font-size:16px;font-weight:700;">Paso 4: Publica y Comparte</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Cambia el estado de la rifa a <strong>"Activa"</strong>. Copia el link público y compártelo en redes sociales, WhatsApp o email. Desde el panel podrás ver en tiempo real cuántos números se han vendido.</p>
      </div>

      <div style="margin:24px 0;padding:20px;background:#f5f3ff;border-radius:12px;border-left:4px solid #7c3aed;">
        <h3 style="margin:0 0 8px;color:#7c3aed;font-size:16px;font-weight:700;">Paso 5: Monitorea y Cierra</h3>
        <p style="margin:0;color:#374151;font-size:14px;line-height:1.6;">Usa el dashboard para ver ingresos, tickets vendidos y estado de pagos. Cuando llegue la fecha del sorteo, el sistema puede realizar el sorteo automáticamente o tú puedes hacerlo manualmente desde el panel.</p>
      </div>

      <div style="margin:28px 0;text-align:center;">
        <a href="${params.frontendUrl}/admin" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Ir al Panel de Control
        </a>
      </div>

      <div style="background:#fefce8;border:1px solid #fef08a;border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:0;font-size:13px;color:#854d0e;line-height:1.5;"><strong>Consejo pro:</strong> Responde rápido las preguntas de los participantes y usa imágenes de alta calidad en tus rifas. Las rifas con fotos profesionales venden hasta 3x más.</p>
      </div>

      <p style="color:#374151;line-height:1.6;font-size:15px;margin:20px 0 0;">¿Necesitas ayuda? Escríbenos a <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a> y te guiamos personalmente.</p>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:contacto@rifalovers.cl" style="color:#7c3aed;">contacto@rifalovers.cl</a></p>
    </div>
  </div>
</body>
</html>`
  }

  private buildNewsletterEmailTemplate(params: {
    subject: string
    bodyHtml: string
    toName?: string
    frontendUrl: string
  }): string {
    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">${params.subject}</title></head>
<body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f9f5ff;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f9f5ff;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="560" style="max-width:560px;background-color:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:1px solid #e5e7eb;">
          <tr>
            <td align="center" style="padding:40px 32px 24px;border-bottom:1px solid #f3f4f6;">
              <img src="${params.frontendUrl}/images/logos/logov2.png" alt="RifaLovers" width="180" style="display:block;max-width:180px;height:auto;">
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${params.toName ? `<p style="margin:0 0 16px;font-size:16px;color:#374151;">Hola ${params.toName},</p>` : ''}
              ${params.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;border-top:1px solid #f3f4f6;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;"><strong style="color:#111827;">RifaLovers</strong> · Chile</p>
              <p style="margin:0;font-size:11px;color:#9ca3af;"><a href="${params.frontendUrl}/newsletter/unsubscribe" style="color:#7c3aed;text-decoration:none;">Darme de baja</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
  }
}
