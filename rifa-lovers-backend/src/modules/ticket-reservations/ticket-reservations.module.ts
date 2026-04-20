import { Module } from '@nestjs/common'
import { TicketReservationsController } from './ticket-reservations.controller'
import { TicketReservationsService } from './ticket-reservations.service'
import { TicketReservationsRepository } from './ticket-reservations.repository'
import { PrismaService } from '../../database/prisma.service'

@Module({
  controllers: [TicketReservationsController],
  providers: [TicketReservationsService, TicketReservationsRepository, PrismaService],
  exports: [TicketReservationsService, TicketReservationsRepository],
})
export class TicketReservationsModule {}
