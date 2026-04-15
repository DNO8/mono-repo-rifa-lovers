"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.THROTTLER_LIMITS = exports.throttlerConfig = void 0;
exports.throttlerConfig = {
    throttlers: [
        {
            name: 'default',
            ttl: 60000,
            limit: 100,
        },
        {
            name: 'auth',
            ttl: 900000,
            limit: 5,
        },
        {
            name: 'admin',
            ttl: 60000,
            limit: 50,
        },
    ],
};
exports.THROTTLER_LIMITS = {
    DEFAULT: { throttler: { default: {} } },
    AUTH: { throttler: { auth: {} } },
    ADMIN: { throttler: { admin: {} } },
    SKIP: { skipThrottle: true },
};
//# sourceMappingURL=throttler.config.js.map