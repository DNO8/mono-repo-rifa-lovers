import { Module } from '@nestjs/common'
import { RafflesController } from './raffles.controller'
import { RafflesService } from './raffles.service'
import { RafflesRepository } from './raffles.repository'
import { RaffleSchedulerService } from './raffle-scheduler.service'
import { CustomerOwnershipGuard } from '../users/guards/customer-ownership.guard'
import { LuckyPassModule } from '../lucky-pass/lucky-pass.module'
import { PacksModule } from '../packs/packs.module'

@Module({
  imports: [LuckyPassModule, PacksModule],
  controllers: [RafflesController],
  providers: [RafflesService, RafflesRepository, RaffleSchedulerService, CustomerOwnershipGuard],
  exports: [RafflesService, RafflesRepository, RaffleSchedulerService, CustomerOwnershipGuard],
})
export class RafflesModule {}
