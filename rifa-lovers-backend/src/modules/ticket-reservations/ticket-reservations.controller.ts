import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  Logger,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { TicketReservationsService } from './ticket-reservations.service'
import { ReserveTicketsDto, TicketReservationResponseDto } from './dto'
import { CurrentUser, Idempotent } from '../../common/decorators'

@Controller('ticket-reservations')
@UseGuards(AuthGuard('jwt'))
export class TicketReservationsController {
  private readonly logger = new Logger(TicketReservationsController.name)

  constructor(private readonly reservationsService: TicketReservationsService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Idempotent()
  async reserve(
    @CurrentUser('id') userId: string,
    @Body() dto: ReserveTicketsDto,
  ): Promise<TicketReservationResponseDto[]> {
    return this.reservationsService.reserve(userId, dto.raffleId, dto.ticketNumbers, dto.purchaseId)
  }

  @Get('mine')
  async getMine(
    @CurrentUser('id') userId: string,
  ): Promise<TicketReservationResponseDto[]> {
    return this.reservationsService.getActiveReservationsForUser(userId)
  }

  @Get('purchase/:purchaseId')
  async getByPurchase(
    @Param('purchaseId', ParseUUIDPipe) purchaseId: string,
  ): Promise<TicketReservationResponseDto[]> {
    return this.reservationsService.getActiveReservationsForPurchase(purchaseId)
  }

  @Delete(':purchaseId')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async release(
    @Param('purchaseId', ParseUUIDPipe) purchaseId: string,
  ): Promise<{ message: string }> {
    await this.reservationsService.release(purchaseId)
    return { message: 'Reservas liberadas' }
  }
}
