import { Module } from '@nestjs/common'
import { OperatorController } from './operator.controller'
import { OperatorService } from './operator.service'
import { DrawModule } from '../draw/draw.module'
import { NewsletterModule } from '../newsletter/newsletter.module'

@Module({
  imports: [DrawModule, NewsletterModule],
  controllers: [OperatorController],
  providers: [OperatorService],
  exports: [OperatorService],
})
export class OperatorModule {}
