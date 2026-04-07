import { Module } from '@nestjs/common'
import { LuckyPassController } from './lucky-pass.controller'
import { LuckyPassService } from './lucky-pass.service'

@Module({
  controllers: [LuckyPassController],
  providers: [LuckyPassService],
  exports: [LuckyPassService],
})
export class LuckyPassModule {}
