import { PacksRepository } from './packs.repository';
import { PackResponseDto } from './dto/pack-response.dto';
export declare class PacksService {
    private readonly packsRepository;
    private readonly logger;
    constructor(packsRepository: PacksRepository);
    findAll(): Promise<PackResponseDto[]>;
    findById(id: string): Promise<PackResponseDto>;
}
