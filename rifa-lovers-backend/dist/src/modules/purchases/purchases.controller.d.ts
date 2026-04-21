import { Observable } from 'rxjs';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto, PurchaseResponseDto } from './dto';
interface MessageEvent {
    data: unknown;
}
export declare class PurchasesController {
    private readonly purchasesService;
    constructor(purchasesService: PurchasesService);
    getMyPurchases(userId: string): Promise<PurchaseResponseDto[]>;
    getById(id: string): Promise<PurchaseResponseDto>;
    create(userId: string, createDto: CreatePurchaseDto): Promise<PurchaseResponseDto>;
    recentPurchasesStream(): Observable<MessageEvent>;
}
export {};
