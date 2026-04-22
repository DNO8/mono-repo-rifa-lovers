import { Controller, Post, Body, HttpCode, HttpStatus, Logger } from '@nestjs/common'
import { ContactService } from './contact.service'
import { ContactFormDto } from './dto/contact-form.dto'

@Controller('contact')
export class ContactController {
  private readonly logger = new Logger(ContactController.name)

  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() dto: ContactFormDto): Promise<{ message: string }> {
    this.logger.log(`Contact form received: name="${dto.name}" email="${dto.email}" messageLength=${dto.message?.length}`)
    await this.contactService.submitContactForm(dto)
    return { message: 'Mensaje enviado exitosamente' }
  }
}
