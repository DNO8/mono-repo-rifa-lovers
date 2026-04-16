"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPurchaseToDto = mapPurchaseToDto;
function mapPurchaseToDto(purchase) {
    const luckyPassCount = purchase.userPacks?.reduce((sum, up) => sum + up.quantity * (up.pack?.luckyPassQuantity ?? 1), 0) ?? 1;
    return {
        id: purchase.id,
        raffleId: purchase.raffleId || '',
        raffleName: purchase.raffle?.title || 'Rifa sin nombre',
        totalAmount: purchase.totalAmount?.toNumber() || 0,
        status: purchase.status,
        createdAt: purchase.createdAt.toISOString(),
        luckyPassCount,
    };
}
//# sourceMappingURL=purchase.mapper.js.map