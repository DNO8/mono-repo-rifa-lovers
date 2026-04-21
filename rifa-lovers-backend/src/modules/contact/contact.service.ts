import { Injectable, Logger } from '@nestjs/common'
import { ResendService } from '../email/resend.service'
import { ContactFormDto } from './dto/contact-form.dto'

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name)

  constructor(private readonly resendService: ResendService) {}

  async submitContactForm(dto: ContactFormDto): Promise<void> {
    this.logger.log(`Procesando formulario de contacto de ${dto.email}`)

    // Enviar email al admin
    await this.resendService.sendContactFormToAdmin({
      name: dto.name,
      email: dto.email,
      message: dto.message,
    })

    // Enviar confirmación al usuario
    await this.resendService.sendContactConfirmationToUser({
      name: dto.name,
      email: dto.email,
      message: dto.message,
    })

    this.logger.log(`Formulario de contacto procesado exitosamente — ${dto.email}`)
  }
}
