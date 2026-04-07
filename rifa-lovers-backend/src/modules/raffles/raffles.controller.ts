import { Controller, Get, UseGuards } from '@nestjs/common'
import { RafflesService } from './raffles.service'
import { RaffleResponseDto, RaffleProgressDto } from './dto'

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  @Get('active')
  async getActive(): Promise<RaffleResponseDto | null> {
    return this.rafflesService.findActive()
  }

  @Get('active/progress')
  async getActiveProgress(): Promise<RaffleProgressDto | null> {
    return this.rafflesService.getActiveProgress()
  }
}
