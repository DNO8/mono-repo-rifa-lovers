import type { Purchase, Raffle, UserPack, Pack } from '@prisma/client'
import type { PurchaseResponseDto } from '../dto'

type PurchaseWithRaffle = Purchase & { raffle: Raffle | null; userPacks?: (UserPack & { pack: Pack | null })[] }

export function mapPurchaseToDto(purchase: PurchaseWithRaffle): PurchaseResponseDto {
  const luckyPassCount =
    purchase.userPacks?.reduce(
      (sum, up) => sum + up.quantity * (up.pack?.luckyPassQuantity ?? 1),
      0,
    ) ?? 1
  return {
    id: purchase.id,
    raffleId: purchase.raffleId || '',
    raffleName: purchase.raffle?.title || 'Rifa sin nombre',
    totalAmount: purchase.totalAmount?.toNumber() || 0,
    status: purchase.status,
    createdAt: purchase.createdAt.toISOString(),
    luckyPassCount,
  }
}
