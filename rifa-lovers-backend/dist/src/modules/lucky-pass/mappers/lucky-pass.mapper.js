"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapLuckyPassToDto = mapLuckyPassToDto;
function mapLuckyPassToDto(pass) {
    return {
        id: pass.id,
        ticketNumber: pass.ticketNumber || 0,
        status: pass.status,
        isWinner: pass.isWinner,
        raffleId: pass.raffleId || '',
        raffleName: pass.raffle?.title || 'Rifa sin nombre',
        createdAt: pass.createdAt.toISOString(),
    };
}
//# sourceMappingURL=lucky-pass.mapper.js.map