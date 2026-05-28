import { Injectable } from '@nestjs/common'
import { ResendService } from '../email/resend.service'
import { ContactFormDto } from './dto/contact-form.dto'

@Injectable()
export class ContactService {

  constructor(private readonly resendService: ResendService) {}

  async submitContactForm(dto: ContactFormDto): Promise<void> {

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

  }
}
