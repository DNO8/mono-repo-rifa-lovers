import { Controller, Post, Get, Param, UseGuards, Logger } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserRole } from '@prisma/client'
import { DrawService, DrawResult } from './draw.service'
import { CurrentUser } from '../../common/decorators'
import { RolesGuard } from '../users/guards/roles.guard'

@Controller()
export class DrawController {
  private readonly logger = new Logger(DrawController.name)

  constructor(private readonly drawService: DrawService) {}

  /**
   * Ejecutar sorteo (solo admin)
   * POST /admin/raffles/:id/draw
   */
  @Post('admin/raffles/:id/draw')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async executeDraw(
    @Param('id') raffleId: string,
    @CurrentUser('id') adminUserId: string,
  ): Promise<DrawResult> {
    this.logger.log(`Admin ${adminUserId} ejecutando sorteo para rifa ${raffleId}`)
    return this.drawService.executeDraw(raffleId, adminUserId)
  }

  /**
   * Verificar si se puede ejecutar sorteo (solo admin)
   * GET /admin/raffles/:id/draw/check
   */
  @Get('admin/raffles/:id/draw/check')
  @UseGuards(AuthGuard('jwt'), new RolesGuard([UserRole.admin, UserRole.operator]))
  async checkDrawAvailability(
    @Param('id') raffleId: string,
  ): Promise<{
    canDraw: boolean
    reason?: string
    prizesCount: number
    activePassesCount: number
  }> {
    return this.drawService.canExecuteDraw(raffleId)
  }

  /**
   * Obtener resultados del sorteo (público)
   * GET /raffles/:id/winners
   */
  @Get('raffles/:id/winners')
  async getDrawResults(@Param('id') raffleId: string): Promise<DrawResult | { message: string }> {
    const results = await this.drawService.getDrawResults(raffleId)
    
    if (!results) {
      return { message: 'El sorteo aún no se ha ejecutado para esta rifa' }
    }
    
    return results
  }

  /**
   * Obtener resultados del sorteo (alternativa, también público)
   * GET /raffles/:id/draw/results
   */
  @Get('raffles/:id/draw/results')
  async getDrawResultsAlt(@Param('id') raffleId: string): Promise<DrawResult | { message: string }> {
    return this.getDrawResults(raffleId)
  }
}
