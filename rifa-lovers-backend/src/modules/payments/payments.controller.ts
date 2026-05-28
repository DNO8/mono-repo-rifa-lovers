import { Controller, Post, Body , NotFoundException, UseGuards, Res, ConflictException, BadRequestException } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import type { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { AuthGuard } from '@nestjs/passport'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'
import { UsersService } from '../users/users.service'
import { ResendService } from '../email/resend.service'
import { CurrentUser, Idempotent } from '../../common/decorators'
import { PrismaService } from '../../database/prisma.service'

interface InitiatePaymentDto {
  purchaseId: string
  idempotencyKey?: string
}

@Controller('payments')
export class PaymentsController {

  constructor(
    private readonly configService: ConfigService,
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
    private readonly usersService: UsersService,
    private readonly resendService: ResendService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('initiate')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Idempotent()
  async initiatePayment(
    @CurrentUser('id') userId: string,
    @Body() dto: InitiatePaymentDto,
  ) {

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


    // Actualizar PaymentTransaction existente con el token de Flow y idempotencyKey
    const updateResult = await this.prisma.paymentTransaction.updateMany({
      where: { purchaseId: purchase.id },
      data: {
        providerTransactionId: flowOrder.token,
        ...(dto.idempotencyKey && { idempotencyKey: dto.idempotencyKey }),
      },
    })

    if (updateResult.count === 0) {
      throw new BadRequestException(
        'No se encontró la transacción de pago asociada a esta compra',
      )
    }


    const paymentUrl = `${flowOrder.url}?token=${flowOrder.token}`

    // Enviar email de pago pendiente al usuario (solo informativo, sin link de pago)
    try {
      void this.resendService.sendPendingPaymentEmail({
        toEmail: user.email,
        toName: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Participante',
        purchaseId: purchase.id,
        raffleName: purchase.raffleName ?? null,
        amount: Number(purchase.totalAmount ?? 0),
      })
    } catch (err) {
    }

    // Flow docs: la URL de redirección = url + "?token=" + token
    return {
      purchaseId: purchase.id,
      flowOrderId: flowOrder.flowOrder.toString(),
      paymentUrl,
      token: flowOrder.token,
    }
  }

  @Post('return')
  async handleFlowReturn(
    @Body('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173'

    // Validate token exists in our database before redirecting
    if (token) {
      const purchase = await this.purchasesService.findByProviderTransactionId(token)
      if (!purchase) {
        const redirectUrl = `${frontendUrl}/payment/return?error=not_found`
        res.setHeader('Content-Type', 'text/html')
        res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`)
        return
      }
    }

    const redirectUrl = token
      ? `${frontendUrl}/payment/return?token=${token}`
      : `${frontendUrl}/payment/return`
    res.setHeader('Content-Type', 'text/html')
    res.send(`<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectUrl}"><script>window.location.replace("${redirectUrl}");</script></head><body></body></html>`)
  }

  /**
   * Crea una nueva orden de pago en Flow para una compra pendiente
   * Permite al usuario reintentar el pago con un token fresco
   */
  @Post('retry')
  @UseGuards(AuthGuard('jwt'))
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async retryPayment(
    @CurrentUser('id') userId: string,
    @Body('purchaseId') purchaseId: string,
  ) {

    if (!purchaseId) {
      throw new NotFoundException('purchaseId requerido')
    }

    const purchase = await this.purchasesService.findById(purchaseId)
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada')
    }
    if (purchase.userId !== userId) {
      throw new BadRequestException('La compra no pertenece al usuario')
    }
    if (purchase.status !== 'pending') {
      throw new BadRequestException(`Solo se pueden reintentar compras pendientes. Estado actual: ${purchase.status}`)
    }

    const user = await this.usersService.findOne(userId)
    if (!user || !user.email) {
      throw new NotFoundException('Usuario no encontrado o sin email')
    }

    const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000'

    // Crear nueva orden en Flow
    const flowOrder = await this.flowService.createPaymentOrder(
      purchase.id,
      `Rifa Lovers - ${purchase.raffleName}`,
      purchase.totalAmount,
      user.email,
      `${backendUrl}/payments/return`,
      `${backendUrl}/webhooks/flow`,
    )


    // Actualizar PaymentTransaction con el nuevo token
    await this.prisma.paymentTransaction.updateMany({
      where: { purchaseId: purchase.id },
      data: { providerTransactionId: flowOrder.token, idempotencyKey: null },
    })

    const paymentUrl = `${flowOrder.url}?token=${flowOrder.token}`

    return {
      purchaseId: purchase.id,
      flowOrderId: flowOrder.flowOrder.toString(),
      paymentUrl,
      token: flowOrder.token,
    }
  }

  @Post('verify-flow-status')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async verifyFlowPaymentStatus(@Body('token') token: string) {

    if (!token) {
      throw new NotFoundException('Token requerido')
    }

    // Buscar la compra por providerTransactionId (token de Flow) en PaymentTransaction
    const purchase = await this.purchasesService.findByProviderTransactionId(token)
    if (!purchase) {
      throw new NotFoundException('Compra no encontrada')
    }

    // Retry loop: reconsultar Flow hasta obtener estado definitivo
    // Flow status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
    const MAX_RETRIES = 5
    const RETRY_DELAY_MS = 3000
    let finalStatus = 1
    let flowOrderId = 0

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      const paymentStatus = await this.flowService.getPaymentStatus(token)
      finalStatus = paymentStatus.status
      flowOrderId = paymentStatus.flowOrder


      if (finalStatus !== 1) {
        // Estado definitivo encontrado (2=pagada, 3=rechazada, 4=anulada)
        break
      }

      // Esperar antes del siguiente intento (excepto en el último)
      if (attempt < MAX_RETRIES - 1) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      }
    }

    // Si Flow indica que el pago fue exitoso, confirmar la compra
    if (finalStatus === 2) {
      try {
        await this.purchasesService.confirmPayment(purchase.id, {
          providerTransactionId: String(flowOrderId),
          provider: 'flow',
          status: 'paid',
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
      }
    }

    // Si Flow indica que el pago fue rechazado o anulado, actualizar el estado de la compra
    if (finalStatus === 3 || finalStatus === 4) {
      await this.purchasesService.updateStatus(purchase.id, 'failed')
    }

    // Re-fetch purchase to return the latest status
    const updatedPurchase = await this.purchasesService.findById(purchase.id)

    // Retornar el estado final de Flow y el estado actual de la compra
    return {
      flowStatus: finalStatus,
      purchaseStatus: updatedPurchase.status,
      purchaseId: purchase.id,
    }
  }
}
