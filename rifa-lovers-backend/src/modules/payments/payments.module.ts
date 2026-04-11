import { Module } from '@nestjs/common'
import { PaymentsController } from './payments.controller'
import { WebhookController } from './webhook.controller'
import { FlowService } from './flow.service'
import { PurchasesModule } from '../purchases/purchases.module'
import { UsersModule } from '../users/users.module'

@Module({
  imports: [PurchasesModule, UsersModule],
  controllers: [PaymentsController, WebhookController],
  providers: [FlowService],
  exports: [FlowService],
})
export class PaymentsModule {}
