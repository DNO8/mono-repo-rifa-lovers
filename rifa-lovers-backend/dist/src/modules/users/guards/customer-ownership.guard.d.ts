import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RafflesRepository } from '../../raffles/raffles.repository';
import { LuckyPassRepository } from '../../lucky-pass/lucky-pass.repository';
export declare class CustomerOwnershipGuard implements CanActivate {
    private readonly rafflesRepository;
    private readonly luckyPassRepository;
    constructor(rafflesRepository: RafflesRepository, luckyPassRepository: LuckyPassRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
