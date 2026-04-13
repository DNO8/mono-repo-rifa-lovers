import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { validateEnv } from './config/env.validation';

// Fase 13 - Hardening: Validar variables de entorno antes de iniciar
try {
  validateEnv();
  Logger.log('✅ Variables de entorno validadas correctamente', 'Bootstrap');
} catch (error) {
  Logger.error('❌ Error validando variables de entorno:', error.message, 'Bootstrap');
  process.exit(1);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Fase 13 - Hardening: Usar logger de Nest en lugar de console
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
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
bootstrap();
