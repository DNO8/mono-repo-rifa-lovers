import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common'
import { RafflesService } from './raffles.service'
import { RaffleResponseDto, RaffleProgressDto } from './dto'
import { PackResponseDto } from '../packs/dto/pack-response.dto'
import { CustomerOwnershipGuard } from '../users/guards/customer-ownership.guard'
import { AuthGuard } from '@nestjs/passport'
import { CurrentUser } from '../../common/decorators'

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get('active')
  async getActive(): Promise<RaffleResponseDto> {
    const raffle = await this.rafflesService.findActive()
    if (!raffle) {
      throw new NotFoundException('No hay rifa activa')
    }
    return raffle
  }

  @Get('public')
  async getPublic(): Promise<RaffleResponseDto[]> {
    return this.rafflesService.getPublicRaffles()
  }

  @Get('active/progress')
  async getActiveProgress(): Promise<RaffleProgressDto | null> {
    return this.rafflesService.getActiveProgress()
  }

  @Get(':id/packs')
  async getRafflePacks(@Param('id') id: string): Promise<PackResponseDto[]> {
    return this.rafflesService.getPacksByRaffle(id)
  }

  @Get(':id/progress')
  async getRaffleProgress(@Param('id') id: string): Promise<RaffleProgressDto> {
    return this.rafflesService.getProgressByRaffle(id)
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'), CustomerOwnershipGuard)
  async getUserRaffles(@CurrentUser('id') userId: string): Promise<RaffleResponseDto[]> {
    return await this.rafflesService.getUserRaffles(userId)
  }

  @Get(':id')
  async getCustomerRaffle(@Param('id') id: string): Promise<RaffleResponseDto> {
    return await this.rafflesService.findById(id)
  }
}
