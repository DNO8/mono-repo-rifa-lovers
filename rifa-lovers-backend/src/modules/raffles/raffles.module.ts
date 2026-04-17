import { Module } from '@nestjs/common'
import { RafflesController } from './raffles.controller'
import { RafflesService } from './raffles.service'
import { RafflesRepository } from './raffles.repository'
import { RaffleSchedulerService } from './raffle-scheduler.service'
import { CustomerOwnershipGuard } from '../users/guards/customer-ownership.guard'

@Module({
  controllers: [RafflesController],
  providers: [RafflesService, RafflesRepository, RaffleSchedulerService, CustomerOwnershipGuard],
  exports: [RafflesService, RafflesRepository, RaffleSchedulerService, CustomerOwnershipGuard],
})
export class RafflesModule {}
