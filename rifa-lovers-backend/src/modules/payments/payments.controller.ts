import { Controller, Post, Body, Logger, NotFoundException, UseGuards, Res, ConflictException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'
import { UsersService } from '../users/users.service'
import { CurrentUser } from '../../common/decorators'
import { PrismaService } from '../../database/prisma.service'

interface InitiatePaymentDto {
  purchaseId: string
  idempotencyKey?: string
}

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name)

  constructor(
    private readonly configService: ConfigService,
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
    private readonly usersService: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {
    this.logger.debug(`Iniciando pago para purchase: ${dto.purchaseId}, user: ${userId}`)

    // 1. Validar idempotencyKey si se proporciona
    if (dto.idempotencyKey) {
      const existingTransaction = await this.prisma.paymentTransaction.findFirst({
        where: {
          idempotencyKey: dto.idempotencyKey,
          purchase: {
            status: 'pending',
          },
        },
      })

      if (existingTransaction) {
        this.logger.warn(`Intento de pago duplicado con idempotencyKey: ${dto.idempotencyKey}`)
        throw new ConflictException('Ya existe un pago en proceso para esta solicitud')
      }
    }

    // 2. Obtener la compra
    const purchase = await this.purchasesService.findById(dto.purchaseId)
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada')
    }

    // 3. Obtener el usuario para el email
    const user = await this.usersService.findOne(userId)
    if (!user || !user.email) {
      throw new NotFoundException('Usuario no encontrado o sin email')
    }

    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'

    // 4. Crear orden en Flow
    const flowOrder = await this.flowService.createPaymentOrder(
      purchase.id,           // commerceOrder (nuestro ID de compra)
      `Rifa Lovers - ${purchase.raffleName}`,  // subject
      purchase.totalAmount, // amount
      user.email,           // email
      `${backendUrl}/payments/return`,    // urlReturn (Flow hace POST aquí, nosotros redirigimos al frontend)
      `${backendUrl}/webhooks/flow`,       // urlConfirmation (donde Flow notifica el pago)
    )

    this.logger.log(`Pago iniciado: purchase=${purchase.id}, flowOrder=${flowOrder.flowOrder}`)

    // Actualizar PaymentTransaction existente con el token de Flow y idempotencyKey
    await this.prisma.paymentTransaction.updateMany({
      where: { purchaseId: purchase.id },
      data: {
        providerTransactionId: flowOrder.token,
        ...(dto.idempotencyKey && { idempotencyKey: dto.idempotencyKey }),
      },
    })
    this.logger.debug(`PaymentTransaction actualizada con token: ${flowOrder.token}`)

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

  @Post('verify-flow-status')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async verifyFlowPaymentStatus(@Body('token') token: string) {
    this.logger.debug(`Verificando estado de pago en Flow con token: ${token}`)

    if (!token) {
      throw new NotFoundException('Token requerido')
    }

    // Buscar la compra por providerTransactionId (token de Flow) en PaymentTransaction
    const purchase = await this.purchasesService.findByProviderTransactionId(token)
    if (!purchase) {
      this.logger.error(`No se encontró compra con providerTransactionId: ${token}`)
      throw new NotFoundException('Compra no encontrada')
    }

    // Retry loop: reconsultar Flow hasta obtener estado definitivo
    // Flow status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
    const MAX_RETRIES = 5
    const RETRY_DELAY_MS = 3000
    let finalStatus = 1
    let commerceOrder = ''

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const paymentStatus = await this.flowService.getPaymentStatus(token)
      finalStatus = paymentStatus.status
      commerceOrder = paymentStatus.commerceOrder

      this.logger.log(
        `Flow status intento ${attempt + 1}/${MAX_RETRIES}: order=${commerceOrder}, status=${finalStatus}`,
      )

      if (finalStatus !== 1) {
        // Estado definitivo encontrado (2=pagada, 3=rechazada, 4=anulada)
        break
      }

      // Esperar antes del siguiente intento (excepto en el último)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }

    // Si Flow indica que el pago fue rechazado o anulado, actualizar el estado de la compra
    if (finalStatus === 3 || finalStatus === 4) {
      await this.purchasesService.updateStatus(purchase.id, 'failed')
      this.logger.log(`Pago marcado como failed por Flow status ${finalStatus}: ${purchase.id}`)
    }

    // Retornar el estado final de Flow y el estado actual de la compra
    return {
      flowStatus: finalStatus,
      purchaseStatus: purchase.status,
      purchaseId: purchase.id,
    }
  }
}
