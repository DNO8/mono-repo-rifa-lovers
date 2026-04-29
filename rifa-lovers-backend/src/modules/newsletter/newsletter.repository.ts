import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'
import type { NewsletterSubscriber, NewsletterCampaign } from '@prisma/client'

@Injectable()
export class NewsletterRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== SUBSCRIBERS ====================

  async findSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
    return this.prisma.newsletterSubscriber.findUnique({ where: { email } })
  }

  async createSubscriber(data: { email: string; name?: string }): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.create({ data })
  }

  async reactivateSubscriber(email: string, name?: string): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: true,
        unsubscribedAt: null,
        ...(name ? { name } : {}),
      },
    })
  }

  async deactivateSubscriber(email: string): Promise<NewsletterSubscriber> {
    return this.prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    })
  }

  async findActiveSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.prisma.newsletterSubscriber.findMany({
      where: { isActive: true },
      orderBy: { subscribedAt: 'desc' },
    })
  }

  async countActiveSubscribers(): Promise<number> {
    return this.prisma.newsletterSubscriber.count({ where: { isActive: true } })
  }

  async findAllSubscribers(): Promise<NewsletterSubscriber[]> {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    })
  }

  // ==================== CAMPAIGNS ====================

  async createCampaign(data: {
    subject: string
    body: string
    sentBy: string
    recipientCount: number
    sentAt: Date
  }): Promise<NewsletterCampaign> {
    return this.prisma.newsletterCampaign.create({ data })
  }

  async findAllCampaigns(): Promise<NewsletterCampaign[]> {
    return this.prisma.newsletterCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { firstName: true, lastName: true, email: true } } },
    })
  }
}
