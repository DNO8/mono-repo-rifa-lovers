import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { AdminService, KpiData, RaffleWithStats } from './admin.service'
import { CreateRaffleDto, UpdateRaffleDto, UpdateRaffleStatusDto, UpdateUserRoleDto, UpdateUserStatusDto } from './dto'
import { CurrentUser } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'
import { JobsService } from '../jobs/jobs.service'

@Controller('admin')
@UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
export class AdminController {
  private readonly logger = new Logger(AdminController.name)

  constructor(
    private readonly adminService: AdminService,
    private readonly jobsService: JobsService,
  ) {}

  // ==================== RIFAS ====================

  @Post('raffles')
  async createRaffle(
    @Body() dto: CreateRaffleDto,
    @CurrentUser('id') adminId: string,
  ) {
    this.logger.log(`POST /admin/raffles - Admin: ${adminId}`)
    return this.adminService.createRaffle(adminId, dto)
  }

  @Get('raffles')
  async getAllRaffles(): Promise<RaffleWithStats[]> {
    this.logger.log('GET /admin/raffles')
    return this.adminService.getAllRaffles()
  }

  @Patch('raffles/:id')
  async updateRaffle(
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleDto,
  ) {
    this.logger.log(`PATCH /admin/raffles/${raffleId}`)
    return this.adminService.updateRaffle(raffleId, dto)
  }

  @Patch('raffles/:id/status')
  async updateRaffleStatus(
    @Param('id') raffleId: string,
    @Body() dto: UpdateRaffleStatusDto,
  ) {
    this.logger.log(`PATCH /admin/raffles/${raffleId}/status`)
    return this.adminService.updateRaffleStatus(raffleId, dto)
  }

  // ==================== KPIs ====================

  @Get('kpis')
  async getKpis(): Promise<KpiData> {
    this.logger.log('GET /admin/kpis')
    return this.adminService.getKpis()
  }

  // ==================== USUARIOS ====================

  @Get('users')
  async getAllUsers(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    this.logger.log('GET /admin/users')
    const skipNum = skip ? parseInt(skip, 10) : 0
    const takeNum = take ? parseInt(take, 10) : 50
    return this.adminService.getAllUsers(skipNum, takeNum)
  }

  @Patch('users/:id/role')
  async updateUserRole(
    @Param('id') userId: string,
    @Body() dto: UpdateUserRoleDto,
  ) {
    this.logger.log(`PATCH /admin/users/${userId}/role`)
    return this.adminService.updateUserRole(userId, dto)
  }

  @Patch('users/:id/block')
  async blockUser(
    @Param('id') userId: string,
    @Body() dto: UpdateUserStatusDto,
  ) {
    this.logger.log(`PATCH /admin/users/${userId}/block`)
    return this.adminService.updateUserStatus(userId, dto)
  }

  // ==================== JOBS (FASE 12) ====================

  @Get('jobs/status')
  async getJobsStatus() {
    this.logger.log('GET /admin/jobs/status')
    return this.jobsService.getJobsStatus()
  }

  @Post('jobs/run/:jobName')
  async runJobManually(
    @Param('jobName') jobName: 'sold_out' | 'closed' | 'expire_purchases',
  ) {
    this.logger.log(`POST /admin/jobs/run/${jobName}`)
    return this.jobsService.runJobManually(jobName)
  }
}
