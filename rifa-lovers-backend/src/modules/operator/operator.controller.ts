import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards , UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Throttle } from '@nestjs/throttler'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { OperatorService } from './operator.service'
import { CreatePackDto, UpdatePackDto, CreateOrganizationDto } from './dto'
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto } from '../admin/dto'
import { CurrentUser, Idempotent } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'

@Controller('operator')
@UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.operator, UserRole.admin]))
export class OperatorController {

  constructor(private readonly operatorService: OperatorService) {}

  // ==================== ORGANIZATION ====================

  @Get('organization')
  async getOrganization(@CurrentUser('id') userId: string) {
    return this.operatorService.getOrganization(userId)
  }

  @Post('organization')
  @Idempotent()
  async createOrganization(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.operatorService.createOrganization(userId, dto)
  }

  // ==================== KPIs ====================

  @Get('kpis')
  async getKpis(@CurrentUser('id') userId: string) {
    return this.operatorService.getKpis(userId)
  }

  // ==================== RIFAS ====================

  @Get('raffles')
  async getRaffles(@CurrentUser('id') userId: string) {
    return this.operatorService.getRaffles(userId)
  }

  @Post('raffles')
  @Idempotent()
  async createRaffle(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRaffleDto,
  ) {
    return this.operatorService.createRaffle(userId, dto)
  }

  @Patch('raffles/:id')
  @Idempotent()
  async updateRaffle(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleDto,
  ) {
    return this.operatorService.updateRaffle(userId, raffleId, dto)
  }

  @Patch('raffles/:id/status')
  @Idempotent()
  async updateRaffleStatus(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleStatusDto,
  ) {
    return this.operatorService.updateRaffleStatus(userId, raffleId, dto)
  }

  @Post('raffles/:id/upload-cover')
  @UseInterceptors(FileInterceptor('file'))
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async uploadCover(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  ) {
    if (!file) throw new BadRequestException('No se envió ningún archivo')
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException('Formato no permitido. Usa JPG, PNG o WEBP')
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BadRequestException('El archivo excede el límite de 5MB')
    }
    return this.operatorService.uploadCover(userId, raffleId, file)
  }

  // ==================== PACKS ====================

  @Get('raffles/:id/packs')
  async getPacks(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
  ) {
    return this.operatorService.getPacks(userId, raffleId)
  }

  @Post('raffles/:id/packs')
  @Idempotent()
  async createPack(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
    @Body() dto: CreatePackDto,
  ) {
    return this.operatorService.createPack(userId, raffleId, dto)
  }

  @Patch('packs/:id')
  @Idempotent()
  async updatePack(
    @CurrentUser('id') userId: string,
    @Param('id') packId: string,
    @Body() dto: UpdatePackDto,
  ) {
    return this.operatorService.updatePack(userId, packId, dto)
  }

  @Delete('packs/:id')
  async deletePack(
    @CurrentUser('id') userId: string,
    @Param('id') packId: string,
  ) {
    return this.operatorService.deletePack(userId, packId)
  }

  // ==================== PARTICIPANTS & DRAW ====================

  @Get('raffles/:id/participants')
  async getParticipants(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
  ) {
    return this.operatorService.getParticipants(userId, raffleId)
  }

  @Get('raffles/:id/draw/status')
  async getDrawStatus(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
  ) {
    return this.operatorService.getDrawStatus(userId, raffleId)
  }

  @Post('raffles/:id/draw')
  @Idempotent()
  async executeDraw(
    @CurrentUser('id') userId: string,
    @Param('id') raffleId: string,
    @Body('prizeId') prizeId?: string,
  ) {
    return this.operatorService.executeDraw(userId, raffleId, prizeId)
  }

  // ==================== NEWSLETTER ====================

  @Get('newsletter/campaigns')
  async getNewsletterCampaigns(@CurrentUser('id') userId: string) {
    return this.operatorService.getNewsletterCampaigns(userId)
  }

  @Post('newsletter/send')
  @Idempotent()
  async sendNewsletter(
    @CurrentUser('id') userId: string,
    @Body() dto: { subject: string; body: string },
  ) {
    return this.operatorService.sendNewsletter(userId, dto)
  }
}
