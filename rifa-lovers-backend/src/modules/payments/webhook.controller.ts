import { Controller, Post, Body, Logger, BadRequestException, HttpCode } from '@nestjs/common'
import { SkipThrottle, Throttle } from '@nestjs/throttler'
import { ConfigService } from '@nestjs/config'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

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
    this.logger.debug(`Recibido webhook de Flow con token: ${token}`)

    if (!token) {
      this.logger.error('Webhook recibido sin token')
      throw new BadRequestException('Token requerido')
    }

    // 1. Consultar estado real del pago en Flow API
    const paymentStatus = await this.flowService.getPaymentStatus(token)
    const { commerceOrder, status, amount } = paymentStatus

    this.logger.log(
      `Flow payment status: order=${commerceOrder}, status=${status}, amount=${amount}`,
    )

    // Buscar la compra por flowToken (que coincide con el token recibido)
    const purchase = await this.purchasesService.findByFlowToken(token)
    if (!purchase) {
      this.logger.error(`No se encontró compra con flowToken: ${token}`)
      throw new BadRequestException('Compra no encontrada')
    }

    // Flow status: 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
    switch (status) {
      case 2: {
        // Pago exitoso - confirmar compra y generar LuckyPasses
        try {
          await this.purchasesService.confirmPayment(purchase.id, {
            providerTransactionId: String(paymentStatus.flowOrder),
            provider: 'flow',
            status: 'paid',
          })
          this.logger.log(`Pago confirmado para compra: ${purchase.id}`)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          const stack = err instanceof Error ? err.stack : undefined
          this.logger.error(`ERROR en confirmPayment para ${purchase.id}: ${msg}`, stack)
        }
        break
      }
      case 3:
      case 4: {
        // Pago rechazado o anulado
        await this.purchasesService.updateStatus(purchase.id, 'failed')
        this.logger.log(`Pago rechazado/anulado para compra: ${purchase.id}`)
        break
      }
      default: {
        this.logger.warn(`Estado de pago no procesable: ${status} para orden ${purchase.id}`)
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
    this.logger.warn(`[DEV] Trigger manual de webhook con token: ${token}`)
    return this.handleFlowWebhook(token)
  }
}
