"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseEntity = void 0;
class PurchaseEntity {
    constructor(partial) {
        Object.assign(this, partial);
    }
    isPending() {
        return this.status === 'pending';
    }
    isPaid() {
        return this.status === 'paid';
    }
    isFailed() {
        return this.status === 'failed';
    }
    isRefunded() {
        return this.status === 'refunded';
    }
    canBePaid() {
        return this.status === 'pending';
    }
    canBeRefunded() {
        return this.status === 'paid';
    }
    markAsPaid() {
        this.status = 'paid';
        this.paidAt = new Date();
    }
    markAsFailed() {
        this.status = 'failed';
    }
    markAsRefunded() {
        this.status = 'refunded';
    }
}
exports.PurchaseEntity = PurchaseEntity;
//# sourceMappingURL=purchase.entity.js.map