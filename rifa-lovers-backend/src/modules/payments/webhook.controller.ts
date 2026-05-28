import { Controller, Post, Body , BadRequestException, HttpCode } from '@nestjs/common'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'

@Controller('webhooks')
export class WebhookController {

  constructor(
    private readonly configService: ConfigService,
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
  ) {}

  /**
   * Webhook para recibir confirmaciones de Flow.cl
   * Flow envía POST con Content-Type: application/x-www-form-urlencoded
   * y un solo parámetro: token
   */
  @Post('flow')
  @HttpCode(200)
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  async handleFlowWebhook(@Body('token') token: string) {

    if (!token) {
      throw new BadRequestException('Token requerido')
    }

    // 1. Consultar estado real del pago en Flow API
    const paymentStatus = await this.flowService.getPaymentStatus(token)
    const { commerceOrder, status, amount } = paymentStatus


    // Buscar la compra por providerTransactionId (token de Flow) en PaymentTransaction
    const purchase = await this.purchasesService.findByProviderTransactionId(token)
    if (!purchase) {
      throw new BadRequestException('Compra no encontrada')
    }

    // Flow status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada

    // Guarda de seguridad: si la compra ya fue invalidada, ignorar el webhook
    if (purchase.status === 'failed') {
      return { message: 'Compra ya invalidada' }
    }

    switch (status) {
      case 2: {
        // Pago exitoso - confirmar compra y generar LuckyPasses
        try {
          await this.purchasesService.confirmPayment(purchase.id, {
            providerTransactionId: String(paymentStatus.flowOrder),
            provider: 'flow',
            status: 'paid',
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          const stack = err instanceof Error ? err.stack : undefined
          // Propagar error a Flow para que reintente el webhook
          throw new BadRequestException(
            `Error procesando confirmación de pago: ${msg}`,
          )
        }
        break
      }
      case 3:
      case 4: {
        // Pago rechazado o anulado
        await this.purchasesService.updateStatus(purchase.id, 'failed')
        break
      }
      default: {
      }
    }

    // Responder 200 a Flow para evitar reintentos
    return { message: 'Webhook procesado' }
  }

  /**
   * DEV ONLY: Dispara manualmente el webhook de Flow con un token.
   * Útil cuando localhost no es accesible por Flow sandbox.
   * Bloqueado en producción.
   * 
   * POST /webhooks/flow/trigger-dev
   * Body: { "token": "<flow_token>" }
   */
  @Post('flow/trigger-dev')
  @SkipThrottle()
  async triggerDev(@Body('token') token: string) {
    if (this.configService.get<string>('NODE_ENV') === 'production') {
      throw new BadRequestException('No disponible en producción')
    }
    if (!token) {
      throw new BadRequestException('Token requerido')
    }
    return this.handleFlowWebhook(token)
  }
}
