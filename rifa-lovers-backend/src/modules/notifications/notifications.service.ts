import { Injectable } from '@nestjs/common'
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

  constructor(private readonly resendService: ResendService) {}

  async sendWinnerEmail(data: WinnerEmailData): Promise<void> {
    await this.resendService.sendWinnerEmail(data)
  }
}
