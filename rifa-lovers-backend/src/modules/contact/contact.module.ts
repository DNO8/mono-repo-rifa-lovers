import { Module } from '@nestjs/common'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'
import { EmailModule } from '../email/email.module'
import { RecaptchaService } from '../../common/services/recaptcha.service'

@Module({
  imports: [EmailModule],
  controllers: [ContactController],
  providers: [ContactService, RecaptchaService],
})
export class ContactModule {}
