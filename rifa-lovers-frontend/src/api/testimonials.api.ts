import { apiClient } from './client'
import { ENDPOINTS } from './endpoints'

export interface TestimonialResponse {
  id: string
  raffleId: string
  text: string
  rating: number
  isPublished: boolean
  createdAt: string
  userName: string | null
}

export interface CreateTestimonialRequest {
  raffleId: string
  luckyPassId: string
  text: string
  rating: number
}

export async function createTestimonial(data: CreateTestimonialRequest): Promise<TestimonialResponse> {
  return apiClient.post<TestimonialResponse>(ENDPOINTS.testimonials.create, data)
}

export async function getPublishedTestimonials(raffleId: string): Promise<TestimonialResponse[]> {
  return apiClient.get<TestimonialResponse[]>(ENDPOINTS.testimonials.byRaffle(raffleId))
}
