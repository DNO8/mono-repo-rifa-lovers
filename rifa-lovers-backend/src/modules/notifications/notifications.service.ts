import { Injectable, Logger } from '@nestjs/common'
import { ResendService } from '../email/resend.service'

export interface WinnerEmailData {
  toEmail: string
  toName: string
  prizeName: string
  passNumber: number
  raffleName: string | null
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(private readonly resendService: ResendService) {}

  async sendWinnerEmail(data: WinnerEmailData): Promise<void> {
    this.logger.log(`Enviando email de ganador a ${data.toEmail}`)
    await this.resendService.sendWinnerEmail(data)
  }
}
