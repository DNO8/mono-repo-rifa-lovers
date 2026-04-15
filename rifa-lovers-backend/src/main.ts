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
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ]
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.flow.cl') ||
        origin.endsWith('.getflow.cl')
      ) {
        callback(null, true)
      } else {
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
