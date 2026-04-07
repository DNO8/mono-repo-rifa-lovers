import { Controller, Get, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { LuckyPassService } from './lucky-pass.service'
import { CurrentUser } from '../../common/decorators'
import { LuckyPassResponseDto, LuckyPassSummaryDto } from './dto'

@Controller('lucky-passes')
export class LuckyPassController {
  constructor(private readonly luckyPassService: LuckyPassService) {}

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyPasses(@CurrentUser('id') userId: string): Promise<LuckyPassResponseDto[]> {
    return this.luckyPassService.findByUser(userId)
  }

  @Get('my/summary')
  @UseGuards(AuthGuard('jwt'))
  async getMySummary(@CurrentUser('id') userId: string): Promise<LuckyPassSummaryDto> {
    return this.luckyPassService.getSummary(userId)
  }
}
