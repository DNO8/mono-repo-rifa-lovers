import { Injectable, Logger, ConflictException } from '@nestjs/common'
import { NewsletterRepository } from './newsletter.repository'
import { ResendService } from '../email/resend.service'
import { SubscribeDto } from './dto/subscribe.dto'
import { SendCampaignDto } from './dto/send-campaign.dto'

@Injectable()
export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name)

  constructor(
    private readonly newsletterRepository: NewsletterRepository,
    private readonly resendService: ResendService,
  ) {}

  async subscribe(dto: SubscribeDto) {
    const existing = await this.newsletterRepository.findSubscriberByEmail(dto.email)

    if (existing && existing.isActive) {
      throw new ConflictException('Este correo ya está suscrito al newsletter')
    }

    if (existing && !existing.isActive) {
      this.logger.log(`Reactivando suscripción: ${dto.email}`)
      return this.newsletterRepository.reactivateSubscriber(dto.email, dto.name)
    }

    this.logger.log(`Nueva suscripción: ${dto.email}`)
    return this.newsletterRepository.createSubscriber({
      email: dto.email,
      name: dto.name,
    })
  }

  async unsubscribe(email: string) {
    const existing = await this.newsletterRepository.findSubscriberByEmail(email)
    if (!existing || !existing.isActive) {
      return { message: 'No estás suscrito al newsletter' }
    }

    this.logger.log(`Desuscribiendo: ${email}`)
    await this.newsletterRepository.deactivateSubscriber(email)
    return { message: 'Te has desuscrito exitosamente' }
  }

  async getSubscribers() {
    const subscribers = await this.newsletterRepository.findAllSubscribers()
    const activeCount = await this.newsletterRepository.countActiveSubscribers()
    return { subscribers, activeCount, totalCount: subscribers.length }
  }

  async getCampaigns() {
    return this.newsletterRepository.findAllCampaigns()
  }

  async sendCampaign(dto: SendCampaignDto, adminId: string) {
    const subscribers = await this.newsletterRepository.findActiveSubscribers()

    if (subscribers.length === 0) {
      return { message: 'No hay suscriptores activos', recipientCount: 0 }
    }

    this.logger.log(`Enviando campaña "${dto.subject}" a ${subscribers.length} suscriptores`)

    let sentCount = 0
    const errors: string[] = []

    for (const subscriber of subscribers) {
      try {
        await this.resendService.sendNewsletterEmail({
          toEmail: subscriber.email,
          toName: subscriber.name ?? undefined,
          subject: dto.subject,
          bodyHtml: dto.body,
        })
        sentCount++
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        this.logger.error(`Error enviando a ${subscriber.email}: ${msg}`)
        errors.push(subscriber.email)
      }
    }

    const campaign = await this.newsletterRepository.createCampaign({
      subject: dto.subject,
      body: dto.body,
      sentBy: adminId,
      recipientCount: sentCount,
      sentAt: new Date(),
    })

    this.logger.log(`Campaña enviada: ${sentCount}/${subscribers.length} exitosos`)

    return {
      campaignId: campaign.id,
      recipientCount: sentCount,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
    }
  }
}
