import { Module } from '@nestjs/common'
import { LuckyPassController } from './lucky-pass.controller'
import { LuckyPassService } from './lucky-pass.service'
import { LuckyPassRepository } from './lucky-pass.repository'
import { RafflesRepository } from '../raffles/raffles.repository'

@Module({
  controllers: [LuckyPassController],
  providers: [LuckyPassService, LuckyPassRepository, RafflesRepository],
  exports: [LuckyPassService, LuckyPassRepository],
})
export class LuckyPassModule {}
