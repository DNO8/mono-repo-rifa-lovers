import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto, PurchaseResponseDto } from './dto';
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    getMyPurchases(userId: string): Promise<PurchaseResponseDto[]>;
    getById(id: string): Promise<PurchaseResponseDto>;
    create(userId: string, createDto: CreatePurchaseDto): Promise<PurchaseResponseDto>;
}
