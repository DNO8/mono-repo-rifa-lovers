"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapUserToDto = mapUserToDto;
function mapUserToDto(user) {
    return {
        id: user.id,
        email: user.email ?? '',
        firstName: user.firstName ?? '',
        lastName: user.lastName ?? '',
        phone: user.phone ?? 0,
        role: user.role,
        status: user.status,
        organizationId: user.organizationId,
        organizationName: user.organization?.name ?? null,
        createdAt: user.createdAt,
    };
}
//# sourceMappingURL=user.mapper.js.map