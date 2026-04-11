import { Controller, Post, Body, Logger, NotFoundException, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'
import { UsersService } from '../users/users.service'
import { CurrentUser } from '../../common/decorators'

interface InitiatePaymentDto {
  purchaseId: string
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name)

  constructor(
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    this.logger.debug(`Iniciando pago para purchase: ${dto.purchaseId}, user: ${userId}`)

    // 1. Obtener la compra
    const purchase = await this.purchasesService.findById(dto.purchaseId)
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada')
    }

    // 2. Obtener el usuario para el email
    const user = await this.usersService.findOne(userId)
    if (!user || !user.email) {
      throw new NotFoundException('Usuario no encontrado o sin email')
    }

    // 3. Crear orden en Flow
    const flowOrder = await this.flowService.createPaymentOrder(
      purchase.id,           // commerceOrder (nuestro ID de compra)
      purchase.raffleName,  // subject
      purchase.totalAmount, // amount
      user.email,           // email
      `${process.env.FRONTEND_URL}/payment/return`,    // urlReturn
      `${process.env.FRONTEND_URL}/api/payments/webhook/flow`, // urlConfirmation
    )

    this.logger.log(`Pago iniciado: purchase=${purchase.id}, flowOrder=${flowOrder.flowOrder}`)

    return {
      purchaseId: purchase.id,
      flowOrderId: flowOrder.flowOrder.toString(),
      paymentUrl: flowOrder.url,
      token: flowOrder.token,
    }
  }
}
