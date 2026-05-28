import { Controller, Post, Body, HttpCode, HttpStatus, Logger, BadRequestException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { ContactService } from './contact.service'
import { RecaptchaService } from '../../common/services/recaptcha.service'
import { ContactFormDto } from './dto/contact-form.dto'
import { Idempotent } from '../../common/decorators'

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name)

  constructor(
    private readonly contactService: ContactService,
    private readonly recaptchaService: RecaptchaService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Idempotent()
  async submitContactForm(@Body() dto: ContactFormDto): Promise<{ message: string }> {
    this.logger.log(`Contact form received: name="${dto.name}" email="${dto.email}" messageLength=${dto.message?.length}`)

    if (dto.recaptchaToken) {
      const isHuman = await this.recaptchaService.verify(dto.recaptchaToken)
      if (!isHuman) {
        throw new BadRequestException('Verificación reCAPTCHA fallida. Intenta de nuevo.')
      }
    }

    await this.contactService.submitContactForm(dto)
    return { message: 'Mensaje enviado exitosamente' }
  }
}
