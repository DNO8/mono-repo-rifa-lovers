import { Module } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { RafflesModule } from '../raffles/raffles.module'

@Module({
  imports: [RafflesModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
