import type { Pack } from '@prisma/client'
import type { PackResponseDto } from '../dto/pack-response.dto'

export function mapPackToDto(pack: Pack): PackResponseDto {
  return {
    id: pack.id,
    name: pack.name,
    price: pack.price?.toNumber() || 0,
    luckyPassQuantity: pack.luckyPassQuantity,
    isFeatured: pack.isFeatured,
    isPreSale: pack.isPreSale,
    createdAt: pack.createdAt.toISOString(),
  }
}
