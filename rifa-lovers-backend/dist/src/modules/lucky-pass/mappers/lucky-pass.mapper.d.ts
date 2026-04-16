import type { LuckyPass, Raffle } from '@prisma/client';
import type { LuckyPassResponseDto } from '../dto';
type LuckyPassWithRaffle = LuckyPass & {
    raffle: Raffle | null;
};
export declare function mapLuckyPassToDto(pass: LuckyPassWithRaffle): LuckyPassResponseDto;
export {};
