import { Controller, Get, Post, Delete, Body, Query, UseGuards, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { NewsletterService } from './newsletter.service'
import { SubscribeDto, SendCampaignDto } from './dto'
import { CurrentUser } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'

@Controller('newsletter')
export class NewsletterController {
  private readonly logger = new Logger(NewsletterController.name)

  constructor(private readonly newsletterService: NewsletterService) {}

  // ==================== PUBLIC ====================

  @Post('subscribe')
  async subscribe(@Body() dto: SubscribeDto) {
    this.logger.log(`POST /newsletter/subscribe — ${dto.email}`)
    return this.newsletterService.subscribe(dto)
  }

  @Delete('unsubscribe')
  async unsubscribe(@Query('email') email: string) {
    this.logger.log(`DELETE /newsletter/unsubscribe — ${email}`)
    return this.newsletterService.unsubscribe(email)
  }

  // ==================== ADMIN ====================

  @Get('subscribers')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async getSubscribers() {
    this.logger.log('GET /newsletter/subscribers')
    return this.newsletterService.getSubscribers()
  }

  @Get('campaigns')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async getCampaigns() {
    this.logger.log('GET /newsletter/campaigns')
    return this.newsletterService.getCampaigns()
  }

  @Post('send')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async sendCampaign(
    @Body() dto: SendCampaignDto,
    @CurrentUser('id') adminId: string,
  ) {
    this.logger.log(`POST /newsletter/send — "${dto.subject}" by ${adminId}`)
    return this.newsletterService.sendCampaign(dto, adminId)
  }
}
