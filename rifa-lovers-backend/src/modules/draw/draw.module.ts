import { Module } from '@nestjs/common'
import { DrawController } from './draw.controller'
import { DrawService } from './draw.service'
import { CustomerDrawController } from './customer-draw.controller'
import { CustomerDrawService } from './customer-draw.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { RafflesModule } from '../raffles/raffles.module'

@Module({
  imports: [NotificationsModule, RafflesModule],
  controllers: [DrawController, CustomerDrawController],
  providers: [DrawService, CustomerDrawService],
  exports: [DrawService, CustomerDrawService],
})
export class DrawModule {}
