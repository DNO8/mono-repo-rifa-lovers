import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

interface FlowOrderRequest {
  commerceOrder: string
  subject: string
  currency: string
  amount: number
  email: string
  paymentMethod?: number
  urlConfirmation: string
  urlReturn: string
}

interface FlowOrderResponse {
  token: string
  url: string
  flowOrder: number
}

@Injectable()
export class FlowService {
  private readonly logger = new Logger(FlowService.name)
  private readonly apiKey: string
  private readonly secretKey: string
  private readonly baseUrl: string

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FLOW_API_KEY') || ''
    this.secretKey = this.configService.get<string>('FLOW_SECRET_KEY') || ''
    this.baseUrl = this.configService.get<string>('FLOW_BASE_URL') || 'https://sandbox.flow.cl/api'
  }

  /**
   * Crea una orden de pago en Flow.cl
   */
  async createPaymentOrder(
    commerceOrder: string,
    subject: string,
    amount: number,
    email: string,
    returnUrl: string,
    confirmationUrl: string,
  ): Promise<FlowOrderResponse> {
    this.logger.debug(`Creando orden de pago Flow: ${commerceOrder}, $${amount}`)

    const params: FlowOrderRequest = {
      commerceOrder,
      subject,
      currency: 'CLP',
      amount: Math.round(amount),
      email,
      urlConfirmation: confirmationUrl,
      urlReturn: returnUrl,
    }

    const signature = this.generateSignature(params)
    
    // Log para debug
    this.logger.debug(`Flow API Key: ${this.apiKey.substring(0, 10)}...`)
    this.logger.debug(`Flow Base URL: ${this.baseUrl}`)
    this.logger.debug(`Signature: ${signature.substring(0, 20)}...`)
    
    const body = new URLSearchParams({
      commerceOrder: params.commerceOrder,
      subject: params.subject,
      currency: params.currency,
      amount: params.amount.toString(),
      email: params.email,
      urlConfirmation: params.urlConfirmation,
      urlReturn: params.urlReturn,
      apiKey: this.apiKey,
      s: signature,
    })

    this.logger.debug(`Request body: ${body.toString().substring(0, 100)}...`)

    try {
      this.logger.debug(`Sending request to: ${this.baseUrl}/payment/create`)
      const response = await fetch(`${this.baseUrl}/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Flow API error: ${response.status} - ${errorText}`)
      }

      const data: FlowOrderResponse = await response.json()
      this.logger.log(`Orden Flow creada: ${data.flowOrder}, token: ${data.token}`)

      return data
    } catch (error: any) {
      this.logger.error(`Error creando orden Flow: ${error.message}`)
      throw error
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async getPaymentStatus(token: string): Promise<any> {
    this.logger.debug(`Consultando estado de pago: ${token}`)

    const params = { apiKey: this.apiKey, token }
    const signature = this.generateSignature(params)

    const url = new URL(`${this.baseUrl}/payment/getStatus`)
    url.searchParams.append('apiKey', this.apiKey)
    url.searchParams.append('token', token)
    url.searchParams.append('s', signature)

    try {
      const response = await fetch(url.toString())

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Flow API error: ${response.status} - ${errorText}`)
      }

      return await response.json()
    } catch (error: any) {
      this.logger.error(`Error consultando estado Flow: ${error.message}`)
      throw error
    }
  }

  /**
   * Valida la firma de un webhook de Flow
   */
  validateWebhookSignature(params: Record<string, string>, signature: string): boolean {
    const calculatedSignature = this.generateSignature(params)
    return calculatedSignature === signature
  }

  /**
   * Genera la firma HMAC-SHA256 para Flow
   */
  private generateSignature(params: Record<string, any>): string {
    // Ordenar las keys alfabéticamente
    const sortedKeys = Object.keys(params).sort()
    
    // Concatenar key + valor
    let toSign = ''
    for (const key of sortedKeys) {
      toSign += key + params[key]
    }

    // Agregar secret key al final
    toSign += this.secretKey

    // Generar HMAC-SHA256
    return crypto.createHmac('sha256', this.secretKey).update(toSign).digest('hex')
  }
}
