import { Module } from '@nestjs/common'
import { NewsletterController } from './newsletter.controller'
import { NewsletterService } from './newsletter.service'
import { NewsletterRepository } from './newsletter.repository'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [EmailModule],
  controllers: [NewsletterController],
  providers: [NewsletterService, NewsletterRepository],
  exports: [NewsletterService],
})
export class NewsletterModule {}
