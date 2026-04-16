import { PacksService } from './packs.service';
import { PackResponseDto } from './dto/pack-response.dto';
export declare class PacksController {
    private readonly packsService;
    private readonly logger;
    constructor(packsService: PacksService);
    findAll(): Promise<PackResponseDto[]>;
    findById(id: string): Promise<PackResponseDto>;
}
