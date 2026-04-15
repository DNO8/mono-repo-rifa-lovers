"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LuckyPassEntity = void 0;
class LuckyPassEntity {
    constructor(partial) {
        Object.assign(this, partial);
    }
    isActive() {
        return this.status === 'active';
    }
    isUsed() {
        return this.status === 'used';
    }
    isWinnerStatus() {
        return this.status === 'winner';
    }
    isCancelled() {
        return this.status === 'cancelled';
    }
    canBeUsed() {
        return this.status === 'active';
    }
    canWinPrize() {
        return this.status === 'active' && !this.isWinner;
    }
    markAsUsed() {
        this.status = 'used';
    }
    markAsWinner() {
        this.isWinner = true;
        this.status = 'winner';
    }
    markAsCancelled() {
        this.status = 'cancelled';
    }
}
exports.LuckyPassEntity = LuckyPassEntity;
//# sourceMappingURL=lucky-pass.entity.js.map