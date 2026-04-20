import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

// Fase 13 - Hardening: Validar variables de entorno antes de iniciar
try {
  validateEnv();
  Logger.log('✅ Variables de entorno validadas correctamente', 'Bootstrap');
} catch (error: unknown) {
  Logger.error('❌ Error validando variables de entorno:', error instanceof Error ? error.message : String(error), 'Bootstrap');
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Fase 13 - Hardening: Usar logger de Nest en lugar de console
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS
  const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '')
  const allowedOrigins = [
    frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'https://rifalovers.cl',
    'https://www.rifalovers.cl',
    'http://rifalovers.cl',
    'http://www.rifalovers.cl',
  ]
  const logger = new Logger('CORS')
  const isRifaLoversDomain = (origin: string) => {
    try {
      const { hostname } = new URL(origin)
      return hostname === 'rifalovers.cl' || hostname.endsWith('.rifalovers.cl')
    } catch {
      return false
    }
  }
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        isRifaLoversDomain(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.flow.cl') ||
        origin.endsWith('.getflow.cl') ||
        origin.endsWith('.ngrok-free.app')
      ) {
        callback(null, true)
      } else {
        logger.warn(`Origen bloqueado por CORS: ${origin}`)
        callback(new Error('Not allowed by CORS'))
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
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
