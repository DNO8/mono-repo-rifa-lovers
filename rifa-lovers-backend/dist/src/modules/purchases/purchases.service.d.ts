import { PurchasesRepository } from './purchases.repository';
import { PacksRepository } from '../packs/packs.repository';
import { RafflesRepository } from '../raffles/raffles.repository';
import { PrismaService } from '../../database/prisma.service';
import { CreatePurchaseDto, PurchaseResponseDto, CreatePurchaseResponseDto } from './dto';
export declare class PurchasesService {
    private readonly purchasesRepository;
    private readonly packsRepository;
    private readonly rafflesRepository;
    private readonly prisma;
    private readonly logger;
    constructor(purchasesRepository: PurchasesRepository, packsRepository: PacksRepository, rafflesRepository: RafflesRepository, prisma: PrismaService);
    findByUser(userId: string): Promise<PurchaseResponseDto[]>;
    create(userId: string, createDto: CreatePurchaseDto): Promise<CreatePurchaseResponseDto>;
    findById(id: string): Promise<PurchaseResponseDto>;
    updateStatus(id: string, status: 'pending' | 'paid' | 'failed' | 'refunded'): Promise<PurchaseResponseDto>;
    confirmPayment(purchaseId: string, paymentData: {
        providerTransactionId: string;
        provider: string;
        status: string;
    }): Promise<PurchaseResponseDto>;
    findByProviderTransactionId(providerTransactionId: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PurchaseStatus;
        createdAt: Date;
        raffleId: string | null;
        userId: string | null;
        totalAmount: import("@prisma/client/runtime/client").Decimal | null;
        paidAt: Date | null;
    } | null>;
}
