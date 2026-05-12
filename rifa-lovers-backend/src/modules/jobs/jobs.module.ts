import { Module } from '@nestjs/common'
import { JobsService } from './jobs.service'
import { RafflesModule } from '../raffles/raffles.module'
import { TicketReservationsModule } from '../ticket-reservations/ticket-reservations.module'
import { EmailModule } from '../email/email.module'
import { PurchasesModule } from '../purchases/purchases.module'
import { PaymentsModule } from '../payments/payments.module'

@Module({
  imports: [RafflesModule, TicketReservationsModule, EmailModule, PurchasesModule, PaymentsModule],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
