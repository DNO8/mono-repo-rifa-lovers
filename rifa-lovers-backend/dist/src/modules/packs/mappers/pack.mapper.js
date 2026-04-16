"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPackToDto = mapPackToDto;
function mapPackToDto(pack) {
    return {
        id: pack.id,
        name: pack.name,
        price: pack.price?.toNumber() || 0,
        luckyPassQuantity: pack.luckyPassQuantity,
        isFeatured: pack.isFeatured,
        isPreSale: pack.isPreSale,
        createdAt: pack.createdAt.toISOString(),
    };
}
//# sourceMappingURL=pack.mapper.js.map