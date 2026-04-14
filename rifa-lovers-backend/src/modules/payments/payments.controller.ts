import { Controller, Post, Body, Logger, NotFoundException, UseGuards, Res } from '@nestjs/common'
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
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
    private readonly configService: ConfigService,
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

    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'

    // 3. Crear orden en Flow
    const flowOrder = await this.flowService.createPaymentOrder(
      purchase.id,           // commerceOrder (nuestro ID de compra)
      `Rifa Lovers - ${purchase.raffleName}`,  // subject
      purchase.totalAmount, // amount
      user.email,           // email
      `${backendUrl}/payments/return`,    // urlReturn (Flow hace POST aquí, nosotros redirigimos al frontend)
      `${backendUrl}/webhooks/flow`,       // urlConfirmation (donde Flow notifica el pago)
    )

    this.logger.log(`Pago iniciado: purchase=${purchase.id}, flowOrder=${flowOrder.flowOrder}`)

    // Flow docs: la URL de redirección = url + "?token=" + token
    return {
      purchaseId: purchase.id,
      flowOrderId: flowOrder.flowOrder.toString(),
      paymentUrl: `${flowOrder.url}?token=${flowOrder.token}`,
      token: flowOrder.token,
    }
  }

  @Post('return')
  handleFlowReturn(
    @Body('token') token: string,
    @Res() res: Response,
  ): void {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'
    this.logger.debug(`Flow return recibido con token: ${token}`)
    const redirectUrl = token
      ? `${frontendUrl}/payment/return?token=${token}`
      : `${frontendUrl}/payment/return`
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`)
  }
}
