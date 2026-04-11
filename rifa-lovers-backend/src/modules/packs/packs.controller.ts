import { Controller, Get, Param, Logger } from '@nestjs/common'
import { PacksService } from './packs.service'
import { PackResponseDto } from './dto/pack-response.dto'

@Controller('packs')
export class PacksController {
  private readonly logger = new Logger(PacksController.name)

  constructor(private readonly packsService: PacksService) {}

  @Get()
  async findAll(): Promise<PackResponseDto[]> {
    this.logger.debug('GET /packs - Listando todos los packs')
    return this.packsService.findAll()
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<PackResponseDto> {
    this.logger.debug(`GET /packs/${id} - Buscando pack por ID`)
    return this.packsService.findById(id)
  }
}
