import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

export interface CreateTestimonialDto {
  raffleId: string
  luckyPassId: string
  text: string
  rating: number
}

export interface TestimonialResponse {
  id: string
  raffleId: string
  text: string
  rating: number
  isPublished: boolean
  createdAt: string
  userName: string | null
}

@Injectable()
export class TestimonialsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTestimonialDto): Promise<TestimonialResponse> {
    const luckyPass = await this.prisma.luckyPass.findUnique({
      where: { id: dto.luckyPassId },
    })

    if (!luckyPass) throw new NotFoundException('LuckyPass no encontrado')
    if (luckyPass.userId !== userId) throw new ForbiddenException('No puedes crear un testimonio para este LuckyPass')
    if (!luckyPass.isWinner) throw new BadRequestException('Solo los ganadores pueden dejar un testimonio')

    const existing = await this.prisma.testimonial.findUnique({
      where: { luckyPassId: dto.luckyPassId },
    })
    if (existing) throw new BadRequestException('Ya dejaste un testimonio para este LuckyPass')

    if (dto.rating < 1 || dto.rating > 5) throw new BadRequestException('El rating debe estar entre 1 y 5')
    if (!dto.text?.trim()) throw new BadRequestException('El testimonio no puede estar vacío')

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    const userName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || null

    const testimonial = await this.prisma.testimonial.create({
      data: {
        raffleId: dto.raffleId,
        userId,
        luckyPassId: dto.luckyPassId,
        text: dto.text.trim(),
        rating: dto.rating,
        isPublished: false,
      },
    })

    return {
      id: testimonial.id,
      raffleId: testimonial.raffleId,
      text: testimonial.text,
      rating: testimonial.rating,
      isPublished: testimonial.isPublished,
      createdAt: testimonial.createdAt.toISOString(),
      userName,
    }
  }

  async getPublishedByRaffle(raffleId: string): Promise<TestimonialResponse[]> {
    const testimonials = await this.prisma.testimonial.findMany({
      where: { raffleId, isPublished: true },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return testimonials.map((t) => ({
      id: t.id,
      raffleId: t.raffleId,
      text: t.text,
      rating: t.rating,
      isPublished: t.isPublished,
      createdAt: t.createdAt.toISOString(),
      userName: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || null,
    }))
  }

  async getAll(): Promise<(TestimonialResponse & { userEmail: string | null })[]> {
    const testimonials = await this.prisma.testimonial.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    })

    return testimonials.map((t) => ({
      id: t.id,
      raffleId: t.raffleId,
      text: t.text,
      rating: t.rating,
      isPublished: t.isPublished,
      createdAt: t.createdAt.toISOString(),
      userName: [t.user?.firstName, t.user?.lastName].filter(Boolean).join(' ') || null,
      userEmail: t.user?.email ?? null,
    }))
  }

  async publish(id: string, isPublished: boolean): Promise<TestimonialResponse> {
    const testimonial = await this.prisma.testimonial.update({
      where: { id },
      data: { isPublished },
      include: { user: true },
    })

    return {
      id: testimonial.id,
      raffleId: testimonial.raffleId,
      text: testimonial.text,
      rating: testimonial.rating,
      isPublished: testimonial.isPublished,
      createdAt: testimonial.createdAt.toISOString(),
      userName: [testimonial.user?.firstName, testimonial.user?.lastName].filter(Boolean).join(' ') || null,
    }
  }
}
