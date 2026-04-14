import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { PurchasesService } from './purchases.service'
import { CurrentUser } from '../../common/decorators'
import { CreatePurchaseDto, PurchaseResponseDto } from './dto'

@Controller('purchases')
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get('my')
  @UseGuards(AuthGuard('jwt'))
  async getMyPurchases(@CurrentUser('id') userId: string): Promise<PurchaseResponseDto[]> {
    return this.purchasesService.findByUser(userId)
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getById(@Param('id') id: string): Promise<PurchaseResponseDto> {
    return this.purchasesService.findById(id)
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.create(userId, createDto)
  }
}
