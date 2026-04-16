import { Module } from '@nestjs/common'
import { DrawController } from './draw.controller'
import { DrawService } from './draw.service'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [NotificationsModule],
  controllers: [DrawController],
  providers: [DrawService],
  exports: [DrawService],
})
export class DrawModule {}
