"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const env_validation_1 = require("./config/env.validation");
try {
    (0, env_validation_1.validateEnv)();
    common_1.Logger.log('✅ Variables de entorno validadas correctamente', 'Bootstrap');
}
catch (error) {
    common_1.Logger.error('❌ Error validando variables de entorno:', error instanceof Error ? error.message : String(error), 'Bootstrap');
    process.exit(1);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');
    const allowedOrigins = [
        frontendUrl,
        'http://localhost:5173',
        'http://localhost:3000',
        'https://rifalovers.cl',
        'https://www.rifalovers.cl',
        'http://rifalovers.cl',
        'http://www.rifalovers.cl',
    ];
    const logger = new common_1.Logger('CORS');
    const isRifaLoversDomain = (origin) => {
        try {
            const { hostname } = new URL(origin);
            return hostname === 'rifalovers.cl' || hostname.endsWith('.rifalovers.cl');
        }
        catch {
            return false;
        }
    };
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin ||
                allowedOrigins.includes(origin) ||
                isRifaLoversDomain(origin) ||
                origin.endsWith('.vercel.app') ||
                origin.endsWith('.onrender.com') ||
                origin.endsWith('.flow.cl') ||
                origin.endsWith('.getflow.cl') ||
                origin.endsWith('.ngrok-free.app')) {
                callback(null, true);
            }
            else {
                logger.warn(`Origen bloqueado por CORS: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Idempotency-Key'],
        preflightContinue: false,
        optionsSuccessStatus: 204,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
//# sourceMappingURL=main.js.map