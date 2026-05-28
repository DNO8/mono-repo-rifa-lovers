import { CustomerDrawService } from './customer-draw.service';
export declare class CustomerDrawController {
    private readonly customerDrawService;
    constructor(customerDrawService: CustomerDrawService);
    checkDrawAvailability(raffleId: string, customerUserId: string): Promise<import("./customer-draw.service").CustomerDrawAvailability>;
    executeDraw(raffleId: string, customerUserId: string): Promise<import("./customer-draw.service").CustomerDrawResult>;
}
