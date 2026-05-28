import { Controller, Get, Post, Delete, Body, Query, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { NewsletterService } from './newsletter.service'
import { SubscribeDto, SendCampaignDto } from './dto'
import { CurrentUser, Idempotent } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'

@Controller('newsletter')
export class NewsletterController {

  constructor(private readonly newsletterService: NewsletterService) {}

  // ==================== PUBLIC ====================

  @Get('check')
  async checkSubscription(@Query('email') email: string) {
    return this.newsletterService.checkSubscription(email)
  }

  @Post('subscribe')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Idempotent()
  async subscribe(@Body() dto: SubscribeDto) {
    return this.newsletterService.subscribe(dto)
  }

  @Delete('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    return this.newsletterService.unsubscribe(email)
  }

  // ==================== ADMIN ====================

  @Get('subscribers')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async getSubscribers() {
    return this.newsletterService.getSubscribers()
  }

  @Get('campaigns')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async getCampaigns() {
    return this.newsletterService.getCampaigns()
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async sendCampaign(
    @Body() dto: SendCampaignDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.newsletterService.sendCampaign(dto, adminId)
  }
}
