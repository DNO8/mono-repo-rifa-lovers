import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export interface NewsletterSubscriber {
  id: string
  email: string
  name: string | null
  isActive: boolean
  subscribedAt: string
  unsubscribedAt: string | null
}

export interface NewsletterCampaign {
  id: string
  subject: string
  body: string
  sentBy: string | null
  sentAt: string | null
  recipientCount: number
  createdAt: string
  admin?: {
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
}

export interface SubscribersResponse {
  subscribers: NewsletterSubscriber[]
  activeCount: number
  totalCount: number
}

export interface SendCampaignRequest {
  subject: string
  body: string
}

export interface SendCampaignResponse {
  campaignId: string
  recipientCount: number
  totalSubscribers: number
  errors?: string[]
}

export async function checkSubscriptionStatus(email: string): Promise<{ subscribed: boolean }> {
  return apiClient.get<{ subscribed: boolean }>(`${ENDPOINTS.newsletter.check}?email=${encodeURIComponent(email)}`)
}

export async function subscribeToNewsletter(email: string, name?: string): Promise<NewsletterSubscriber> {
  return apiClient.post<NewsletterSubscriber>(ENDPOINTS.newsletter.subscribe, { email, name })
}

export async function unsubscribeFromNewsletter(email: string): Promise<{ message: string }> {
  return apiClient.delete<{ message: string }>(`${ENDPOINTS.newsletter.unsubscribe}?email=${encodeURIComponent(email)}`)
}

export async function getNewsletterSubscribers(): Promise<SubscribersResponse> {
  return apiClient.get<SubscribersResponse>(ENDPOINTS.newsletter.subscribers)
}

export async function getNewsletterCampaigns(): Promise<NewsletterCampaign[]> {
  return apiClient.get<NewsletterCampaign[]>(ENDPOINTS.newsletter.campaigns)
}

export async function sendNewsletterCampaign(data: SendCampaignRequest): Promise<SendCampaignResponse> {
  return apiClient.post<SendCampaignResponse>(ENDPOINTS.newsletter.send, data)
}
