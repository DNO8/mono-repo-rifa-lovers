import { Module } from '@nestjs/common'
import { LuckyPassController } from './lucky-pass.controller'
import { LuckyPassService } from './lucky-pass.service'
import { LuckyPassRepository } from './lucky-pass.repository'
import { RafflesRepository } from '../raffles/raffles.repository'
import { PrismaService } from '../../database/prisma.service'

@Module({
  controllers: [LuckyPassController],
  providers: [LuckyPassService, LuckyPassRepository, RafflesRepository, PrismaService],
  exports: [LuckyPassService, LuckyPassRepository],
})
export class LuckyPassModule {}
