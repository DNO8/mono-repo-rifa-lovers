import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import * as crypto from 'crypto'

interface FlowOrderResponse {
  token: string
  url: string
  flowOrder: number
}

export interface FlowPaymentData {
  date: string | null
  media: string | null
  amount: number | null
  currency: string | null
  fee: number | null
  balance: number | null
  transferDate: string | null
}

// Flow PaymentStatus: status 1=pendiente, 2=pagada, 3=rechazada, 4=anulada
export interface FlowPaymentStatus {
  flowOrder: number
  commerceOrder: string
  requestDate: string
  status: number
  subject: string
  currency: string
  amount: number
  payer: string
  optional: Record<string, string> | null
  paymentData: FlowPaymentData
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
    // Modo test - retornar mock sin llamar a Flow
    if (process.env.NODE_ENV === 'test') {
      return {
        token: `test_token_${Date.now()}`,
        url: 'https://sandbox.flow.cl/test',
        flowOrder: parseInt(`99${Date.now().toString().slice(-6)}`),
      }
    }

    this.logger.debug(`Creando orden de pago Flow: ${commerceOrder}, $${amount}`)

    const params: Record<string, string | number> = {
      apiKey: this.apiKey,
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
    
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      body.append(key, String(value))
    }
    body.append('s', signature)

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

      const data = (await response.json()) as FlowOrderResponse
      this.logger.log(`Orden Flow creada: ${data.flowOrder}, token: ${data.token}`)

      return data
    } catch (error: unknown) {
      this.logger.error(`Error creando orden Flow: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Verifica el estado de un pago
   */
  async getPaymentStatus(token: string): Promise<FlowPaymentStatus> {
    // Modo test - retornar mock sin llamar a Flow
    if (process.env.NODE_ENV === 'test') {
      return {
        flowOrder: 12345,
        commerceOrder: token,
        requestDate: new Date().toISOString(),
        status: 2, // 2 = pagado en Flow
        subject: 'Test Payment',
        currency: 'CLP',
        amount: 1000,
        payer: 'test@example.com',
        optional: null,
        paymentData: {
          date: new Date().toISOString(),
          media: 'test',
          amount: 1000,
          currency: 'CLP',
          fee: 0,
          balance: 1000,
          transferDate: new Date().toISOString(),
        },
      }
    }

    this.logger.debug(`Consultando estado de pago: ${token}`)

    const params: Record<string, string> = { apiKey: this.apiKey, token }
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

      const data = (await response.json()) as FlowPaymentStatus
      this.logger.debug(`Flow payment status: order=${data.commerceOrder}, status=${data.status}`)
      return data
    } catch (error: unknown) {
      this.logger.error(`Error consultando estado Flow: ${error instanceof Error ? error.message : String(error)}`)
      throw error
    }
  }

  /**
   * Genera la firma HMAC-SHA256 para Flow
   */
  private generateSignature(params: Record<string, string | number>): string {
    // Ordenar las keys alfabéticamente
    const sortedKeys = Object.keys(params).sort()
    
    // Concatenar key + valor
    let toSign = ''
    for (const key of sortedKeys) {
      toSign += key + params[key]
    }

    // Generar HMAC-SHA256 (secretKey es SOLO la key del HMAC, NO se concatena al string)
    return crypto.createHmac('sha256', this.secretKey).update(toSign).digest('hex')
  }
}
