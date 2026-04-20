export declare class ReserveTicketsDto {
    raffleId: string;
    purchaseId: string;
    ticketNumbers: number[];
}
export declare class TicketReservationResponseDto {
    id: string;
    raffleId: string;
    ticketNumber: number;
    userId: string;
    purchaseId: string | null;
    expiresAt: string;
    createdAt: string;
}
