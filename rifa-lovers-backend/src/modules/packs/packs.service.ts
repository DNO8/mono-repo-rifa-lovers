import { Injectable , NotFoundException } from '@nestjs/common'
import { PacksRepository } from './packs.repository'
import { PackResponseDto } from './dto/pack-response.dto'
import { mapPackToDto } from './mappers/pack.mapper'

@Injectable()
export class PacksService {

  constructor(private readonly packsRepository: PacksRepository) {}

  async findAll(): Promise<PackResponseDto[]> {

    const packs = await this.packsRepository.findMany(
      {}, // Sin filtro - incluir todos los packs (activos y pre-sale)
      { price: 'asc' }, // Ordenar por precio
    )

    return packs.map(mapPackToDto)
  }

  async findById(id: string): Promise<PackResponseDto> {

    const pack = await this.packsRepository.findUnique({ id })

    if (!pack) {
      throw new NotFoundException(`Pack con ID ${id} no encontrado`)
    }

    return mapPackToDto(pack)
  }
}
