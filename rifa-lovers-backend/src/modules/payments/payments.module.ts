import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { WebhookController } from './webhook.controller'
import { FlowService } from './flow.service'
import { PurchasesModule } from '../purchases/purchases.module'
import { UsersModule } from '../users/users.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [PurchasesModule, UsersModule, EmailModule],
  controllers: [PaymentsController, WebhookController],
  providers: [FlowService],
  exports: [FlowService],
})
export class PaymentsModule {}
