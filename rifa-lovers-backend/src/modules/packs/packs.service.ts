import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PacksRepository } from './packs.repository'
import { PackResponseDto } from './dto/pack-response.dto'
import { mapPackToDto } from './mappers/pack.mapper'

@Injectable()
export class PacksService {
  private readonly logger = new Logger(PacksService.name)

  constructor(private readonly packsRepository: PacksRepository) {}

  async findAll(): Promise<PackResponseDto[]> {
    this.logger.debug('Buscando todos los packs')

    const packs = await this.packsRepository.findMany(
      { isPreSale: false }, // Solo packs activos (no pre-sale)
      { price: 'asc' }, // Ordenar por precio
    )

    this.logger.debug(`Encontrados ${packs.length} packs`)
    return packs.map(mapPackToDto)
  }

  async findById(id: string): Promise<PackResponseDto> {
    this.logger.debug(`Buscando pack por ID: ${id}`)

    const pack = await this.packsRepository.findUnique({ id })

    if (!pack) {
      this.logger.warn(`Pack no encontrado: ${id}`)
      throw new NotFoundException(`Pack con ID ${id} no encontrado`)
    }

    return mapPackToDto(pack)
  }
}
