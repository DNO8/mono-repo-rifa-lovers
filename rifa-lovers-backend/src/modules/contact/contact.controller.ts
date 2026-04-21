import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ContactService } from './contact.service'
import { ContactFormDto } from './dto/contact-form.dto'

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContactForm(@Body() dto: ContactFormDto): Promise<{ message: string }> {
    await this.contactService.submitContactForm(dto)
    return { message: 'Mensaje enviado exitosamente' }
  }
}
