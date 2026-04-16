import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { TestimonialsService } from './testimonials.service'
import type { CreateTestimonialDto } from './testimonials.service'
import { CurrentUser } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'

@Controller()
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Post('testimonials')
  @UseGuards(AuthGuard('jwt'))
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTestimonialDto,
  ) {
    return this.testimonialsService.create(userId, dto)
  }

  @Get('raffles/:raffleId/testimonials')
  async getPublished(@Param('raffleId') raffleId: string) {
    return this.testimonialsService.getPublishedByRaffle(raffleId)
  }

  @Get('admin/testimonials')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async getAll() {
    return this.testimonialsService.getAll()
  }

  @Patch('admin/testimonials/:id/publish')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async publish(
    @Param('id') id: string,
    @Body() body: { isPublished: boolean },
  ) {
    return this.testimonialsService.publish(id, body.isPublished)
  }
}
