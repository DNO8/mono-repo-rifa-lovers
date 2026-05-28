import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { AdminService, Participant, KpiData, RaffleWithStats } from './admin.service'
import { DrawService } from '../draw/draw.service'
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto'
import { CurrentUser } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'
import { JobsService } from '../jobs/jobs.service'

@Controller('admin')
@UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
export class AdminController {

  constructor(
    private readonly adminService: AdminService,
    private readonly drawService: DrawService,
    private readonly jobsService: JobsService,
  ) {}

  // ==================== RIFAS ====================

  @Post('raffles')
  async createRaffle(
    @Body() dto: CreateRaffleDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.adminService.createRaffle(adminId, dto)
  }

  @Get('raffles')
  async getAllRaffles(): Promise<RaffleWithStats[]> {
    return this.adminService.getAllRaffles()
  }

  @Patch('raffles/:id')
  async updateRaffle(
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleDto,
  ) {
    return this.adminService.updateRaffle(raffleId, dto)
  }

  @Patch('raffles/:id/status')
  async updateRaffleStatus(
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleStatusDto,
  ) {
    return this.adminService.updateRaffleStatus(raffleId, dto)
  }

  // ==================== STREAMING / SORTEO ====================

  @Get('raffles/:id/detail')
  async getRaffleById(@Param('id') raffleId: string) {
    return this.adminService.getRaffleDetail(raffleId)
  }

  @Get('raffles/:id/participants')
  async getRaffleParticipants(@Param('id') raffleId: string): Promise<Participant[]> {
    return this.adminService.getRaffleParticipants(raffleId)
  }

  @Get('raffles/:id/draw/status')
  async getDrawStatus(@Param('id') raffleId: string) {
    const canExecute = await this.drawService.canExecuteDraw(raffleId)
    const results = await this.drawService.getDrawResults(raffleId)
    return {
      canExecute,
      results: results && results.winners.length > 0 ? results : null,
    }
  }

  @Post('raffles/:id/draw')
  async executeDraw(
    @Param('id') raffleId: string,
    @CurrentUser('id') operatorId: string,
    @Body('prizeId') prizeId?: string,
  ) {
    return this.drawService.executeDraw(raffleId, operatorId, prizeId)
  }

  @Post('raffles/:id/draw/reset')
  async resetDraw(
    @Param('id') raffleId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.drawService.resetDraw(raffleId, operatorId)
  }

  // ==================== KPIs ====================

  @Get('kpis')
  async getKpis(): Promise<KpiData> {
    return this.adminService.getKpis()
  }

  // ==================== USUARIOS ====================

  @Get('users')
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : 0
    const takeNum = take ? parseInt(take, 10) : 50
    return this.adminService.getAllUsers(skipNum, takeNum)
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, dto)
  }

  @Patch('users/:id/block')
  async blockUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    return this.adminService.updateUserStatus(userId, dto)
  }

  // ==================== JOBS (FASE 12) ====================

  @Get('jobs/status')
  async getJobsStatus() {
    return this.jobsService.getJobsStatus()
  }

  @Post('jobs/run/:jobName')
  async runJobManually(
    @Param('jobName') jobName: 'sold_out' | 'closed' | 'expire_purchases',
  ) {
    return this.jobsService.runJobManually(jobName)
  }
}
