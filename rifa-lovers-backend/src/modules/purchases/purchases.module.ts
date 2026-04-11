import { Module } from '@nestjs/common'
import { PurchasesController } from './purchases.controller'
import { PurchasesService } from './purchases.service'
import { PurchasesRepository } from './purchases.repository'
import { PacksRepository } from '../packs/packs.repository'
import { RafflesRepository } from '../raffles/raffles.repository'

@Module({
  controllers: [PurchasesController],
  providers: [PurchasesService, PurchasesRepository, PacksRepository, RafflesRepository],
  exports: [PurchasesService, PurchasesRepository],
})
export class PurchasesModule {}
