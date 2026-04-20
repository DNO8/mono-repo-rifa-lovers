import { Module } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { RafflesModule } from '../raffles/raffles.module'
import { TicketReservationsModule } from '../ticket-reservations/ticket-reservations.module'

@Module({
  imports: [RafflesModule, TicketReservationsModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
