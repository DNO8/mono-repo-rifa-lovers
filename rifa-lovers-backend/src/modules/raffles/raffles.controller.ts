import { Controller, Get, NotFoundException } from '@nestjs/common'
import { RafflesService } from './raffles.service'
import { RaffleResponseDto, RaffleProgressDto } from './dto'

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
}
