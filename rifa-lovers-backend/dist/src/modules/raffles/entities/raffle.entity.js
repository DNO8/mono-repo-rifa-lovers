"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaffleEntity = void 0;
class RaffleEntity {
    constructor(partial) {
        Object.assign(this, partial);
    }
    isActive() {
        return this.status === 'active';
    }
    isDraft() {
        return this.status === 'draft';
    }
    isSoldOut() {
        return this.status === 'sold_out';
    }
    isClosed() {
        return this.status === 'closed';
    }
    isDrawn() {
        return this.status === 'drawn';
    }
    canBeActivated() {
        return this.status === 'draft';
    }
    canAcceptPurchases() {
        return this.status === 'active';
    }
}
exports.RaffleEntity = RaffleEntity;
//# sourceMappingURL=raffle.entity.js.map