import { Controller, Get, Post, Body, Param, UseGuards, Sse } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { interval, Observable, switchMap, map } from 'rxjs'
import { PurchasesService } from './purchases.service'
import { CurrentUser, Idempotent } from '../../common/decorators'
import { CreatePurchaseDto, PurchaseResponseDto } from './dto'
// MessageEvent type for SSE
interface MessageEvent {
  data: unknown
}

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
  @Idempotent()
  async create(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.create(userId, createDto)
  }

  @Post('free')
  @UseGuards(AuthGuard('jwt'))
  @Idempotent()
  async createFree(
    @CurrentUser('id') userId: string,
    @Body() createDto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.purchasesService.createFreePurchase(userId, createDto)
  }

  /**
   * SSE stream for recent purchases (live ticker)
   * Updates every 30 seconds
   */
  @Sse('recent/stream')
  recentPurchasesStream(): Observable<MessageEvent> {
    return interval(30000).pipe(
      switchMap(() => this.purchasesService.getRecentPurchases()),
      map((data): MessageEvent => ({ data }))
    )
  }
}
