import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as nodemailer from 'nodemailer'

export interface WinnerEmailData {
  toEmail: string
  toName: string
  prizeName: string
  passNumber: number
  raffleName: string | null
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)
  private transporter: nodemailer.Transporter | null = null

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')
    const user = this.config.get<string>('SMTP_USER')
    const pass = this.config.get<string>('SMTP_PASS')
    const port = parseInt(this.config.get<string>('SMTP_PORT') ?? '587', 10)
    const from = this.config.get<string>('FROM_EMAIL') ?? 'noreply@rifalovers.com'

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        from,
      })
      this.logger.log('Servicio de email inicializado')
    } else {
      this.logger.warn('SMTP no configurado — emails deshabilitados')
    }
  }

  async sendWinnerEmail(data: WinnerEmailData): Promise<void> {
    if (!this.transporter) {
      this.logger.warn(`[EMAIL SKIP] Ganador: ${data.toEmail} — ${data.prizeName}`)
      return
    }

    const from = this.config.get<string>('FROM_EMAIL') ?? 'noreply@rifalovers.com'
    const firstName = data.toName.split(' ')[0] || 'Ganador'
    const raffle = data.raffleName ?? 'RifaLovers'

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>¡Ganaste!</title></head>
<body style="font-family:Arial,sans-serif;background:#f9f5ff;margin:0;padding:0;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px 32px;text-align:center;">
      <div style="font-size:56px;margin-bottom:12px;">🏆</div>
      <h1 style="color:#fff;margin:0;font-size:28px;font-weight:800;">¡Felicitaciones, ${firstName}!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;">Tu LuckyPass fue seleccionado en el sorteo</p>
    </div>
    <div style="padding:32px;">
      <div style="background:#f9f5ff;border:2px solid #ede9fe;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        <p style="margin:0 0 4px;font-size:13px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Premio ganado</p>
        <p style="margin:0;font-size:22px;font-weight:800;color:#7c3aed;">${data.prizeName}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#9ca3af;">LuckyPass #${String(data.passNumber).padStart(5, '0')} · ${raffle}</p>
      </div>
      <p style="color:#374151;line-height:1.6;font-size:15px;">El equipo de RifaLovers se pondrá en contacto contigo a la brevedad para coordinar la entrega de tu premio. Asegúrate de tener tus datos de contacto actualizados.</p>
      <div style="margin-top:28px;text-align:center;">
        <a href="${this.config.get('FRONTEND_URL') ?? 'https://rifalovers.com'}/dashboard" style="background:#7c3aed;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
          Ver en mi cuenta
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid #f3f4f6;text-align:center;">
      <p style="margin:0;font-size:12px;color:#9ca3af;">RifaLovers · Chile · <a href="mailto:hola@rifalovers.com" style="color:#7c3aed;">hola@rifalovers.com</a></p>
    </div>
  </div>
</body>
</html>`

    try {
      await this.transporter.sendMail({
        from: `RifaLovers <${from}>`,
        to: data.toEmail,
        subject: `🏆 ¡Ganaste ${data.prizeName} en ${raffle}!`,
        html,
      })
      this.logger.log(`Email ganador enviado a ${data.toEmail}`)
    } catch (err) {
      this.logger.error(`Error enviando email a ${data.toEmail}: ${err}`)
    }
  }
}
