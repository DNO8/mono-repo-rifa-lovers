import { TicketReservationsService } from './ticket-reservations.service';
import { ReserveTicketsDto, TicketReservationResponseDto } from './dto';
export declare class TicketReservationsController {
    private readonly reservationsService;
    constructor(reservationsService: TicketReservationsService);
    reserve(userId: string, dto: ReserveTicketsDto): Promise<TicketReservationResponseDto[]>;
    getMine(userId: string): Promise<TicketReservationResponseDto[]>;
    getByPurchase(purchaseId: string): Promise<TicketReservationResponseDto[]>;
    release(purchaseId: string): Promise<{
        message: string;
    }>;
}
