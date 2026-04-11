import { Controller, Post, Body, Logger, Headers, BadRequestException } from '@nestjs/common'
import { FlowService } from './flow.service'
import { PurchasesService } from '../purchases/purchases.service'

@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name)

  constructor(
    private readonly flowService: FlowService,
    private readonly purchasesService: PurchasesService,
  ) {}

  /**
   * Webhook para recibir confirmaciones de Flow.cl
   */
  @Post('flow')
  async handleFlowWebhook(
    @Body() body: any,
    @Headers('signature') signature: string,
  ) {
    this.logger.debug('Recibido webhook de Flow', body)

    // 1. Validar firma del webhook
    const isValid = this.flowService.validateWebhookSignature(body, signature)
    if (!isValid) {
      this.logger.error('Firma de webhook inválida')
      throw new BadRequestException('Firma inválida')
    }

    // 2. Obtener datos del pago
    const { token, status, commerceOrder } = body

    this.logger.log(`Webhook Flow: token=${token}, status=${status}, order=${commerceOrder}`)

    // 3. Procesar según el estado
    if (status === 'success') {
      // Pago exitoso - confirmar compra y generar LuckyPasses
      await this.purchasesService.confirmPayment(commerceOrder, {
        providerTransactionId: token,
        provider: 'flow',
        status: 'paid',
      })
      
      this.logger.log(`✅ Pago confirmado para compra: ${commerceOrder}`)
    } else if (status === 'rejected') {
      // Pago rechazado
      await this.purchasesService.updateStatus(commerceOrder, 'failed')
      
      this.logger.log(`❌ Pago rechazado para compra: ${commerceOrder}`)
    }

    // 4. Responder a Flow (siempre 200 para evitar reintentos)
    return { received: true }
  }
}
