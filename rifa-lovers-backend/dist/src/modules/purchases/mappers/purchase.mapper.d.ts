import type { Purchase, Raffle, UserPack, Pack } from '@prisma/client';
import type { PurchaseResponseDto } from '../dto';
type PurchaseWithRaffle = Purchase & {
    raffle: Raffle | null;
    userPacks?: (UserPack & {
        pack: Pack | null;
    })[];
};
export declare function mapPurchaseToDto(purchase: PurchaseWithRaffle): PurchaseResponseDto;
export {};
