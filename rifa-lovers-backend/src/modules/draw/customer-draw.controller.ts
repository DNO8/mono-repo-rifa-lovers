import { Controller, Get, Post, Param, HttpCode, HttpStatus, Logger, UseGuards } from '@nestjs/common'
import { CustomerDrawService } from './customer-draw.service'
import { CurrentUser } from '../../common/decorators'
import { AuthGuard } from '@nestjs/passport'
import { RolesGuard } from '../users/guards/roles.guard'
import { CustomerOwnershipGuard } from '../users/guards/customer-ownership.guard'

@Controller('customer/draw')
@UseGuards(AuthGuard('jwt'), new RolesGuard(['customer']), CustomerOwnershipGuard)
export class CustomerDrawController {
  private readonly logger = new Logger(CustomerDrawController.name)

  constructor(private readonly customerDrawService: CustomerDrawService) {}

  /**
   * Verificar si se puede ejecutar sorteo (solo customer)
   * GET /customer/draw/:raffleId/check
   */
  @Get(':raffleId/check')
  async checkDrawAvailability(
    @Param('raffleId') raffleId: string,
    @CurrentUser('id') customerUserId: string,
  ) {
    this.logger.log(`Customer ${customerUserId} verificando disponibilidad de sorteo para raffle ${raffleId}`)
    return this.customerDrawService.checkCustomerDrawAvailability(raffleId, customerUserId)
  }

  /**
   * Ejecutar sorteo (solo customer)
   * POST /customer/draw/:raffleId
   */
  @Post(':raffleId')
  @HttpCode(HttpStatus.OK)
  async executeDraw(
    @Param('raffleId') raffleId: string,
    @CurrentUser('id') customerUserId: string,
  ) {
    this.logger.log(`Customer ${customerUserId} ejecutando sorteo para raffle ${raffleId}`)
    return this.customerDrawService.executeCustomerDraw(raffleId, customerUserId)
  }
}
