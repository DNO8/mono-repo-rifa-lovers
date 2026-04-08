import { Module } from '@nestjs/common'
import { LuckyPassController } from './lucky-pass.controller'
import { LuckyPassService } from './lucky-pass.service'
import { LuckyPassRepository } from './lucky-pass.repository'

@Module({
  controllers: [LuckyPassController],
  providers: [LuckyPassService, LuckyPassRepository],
  exports: [LuckyPassService, LuckyPassRepository],
})
export class LuckyPassModule {}
