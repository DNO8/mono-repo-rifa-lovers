import { RafflesService } from './raffles.service';
import { RaffleResponseDto, RaffleProgressDto } from './dto';
export declare class RafflesController {
    private readonly rafflesService;
    constructor(rafflesService: RafflesService);
    getActive(): Promise<RaffleResponseDto>;
    getActiveProgress(): Promise<RaffleProgressDto | null>;
}
