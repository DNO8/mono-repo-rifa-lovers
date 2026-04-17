import { CanActivate, ExecutionContext } from '@nestjs/common';
import { RafflesRepository } from '../../raffles/raffles.repository';
export declare class CustomerOwnershipGuard implements CanActivate {
    private readonly rafflesRepository;
    constructor(rafflesRepository: RafflesRepository);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
