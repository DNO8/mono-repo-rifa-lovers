import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common'
import { RafflesService } from './raffles.service'
import { RaffleResponseDto, RaffleProgressDto } from './dto'
import { CustomerOwnershipGuard } from '../users/guards/customer-ownership.guard'
import { AuthGuard } from '@nestjs/passport'

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

  @Get('active/progress')
  async getActiveProgress(): Promise<RaffleProgressDto | null> {
    return this.rafflesService.getActiveProgress()
  }

  @Get('user')
  @UseGuards(AuthGuard('jwt'), CustomerOwnershipGuard)
  async getUserRaffles(): Promise<RaffleResponseDto[]> {
    return await this.rafflesService.getUserRaffles()
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), CustomerOwnershipGuard)
  async getCustomerRaffle(@Param('id') id: string): Promise<RaffleResponseDto> {
    return await this.rafflesService.findById(id)
  }
}
