import { ThrottlerModuleOptions } from '@nestjs/throttler';
export declare const throttlerConfig: ThrottlerModuleOptions;
export declare const THROTTLER_LIMITS: {
    DEFAULT: {
        throttler: {
            default: {};
        };
    };
    AUTH: {
        throttler: {
            auth: {};
        };
    };
    ADMIN: {
        throttler: {
            admin: {};
        };
    };
    SKIP: {
        skipThrottle: boolean;
    };
};
