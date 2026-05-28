import { Controller, Get, Param } from '@nestjs/common'
import { PacksService } from './packs.service'
import { PackResponseDto } from './dto/pack-response.dto'

@Controller('packs')
export class PacksController {

  constructor(private readonly packsService: PacksService) {}

  @Get()
  async findAll(): Promise<PackResponseDto[]> {
    return this.packsService.findAll()
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PackResponseDto> {
    return this.packsService.findById(id)
  }
}
