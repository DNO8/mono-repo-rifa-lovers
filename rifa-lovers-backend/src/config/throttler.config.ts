import { ThrottlerModuleOptions, ThrottlerOptions } from '@nestjs/throttler'

/**
 * Configuración de Rate Limiting
 * Fase 13 - Hardening
 * 
 * Límites:
 * - Default: 100 peticiones por 60 segundos por IP
 * - Auth: 5 intentos de login por 15 minutos
 * - Strict: 20 peticiones por 60 segundos (para endpoints sensibles)
 */

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    // Límite general
    {
      name: 'default',
      ttl: 60000, // 60 segundos
      limit: 100, // 100 peticiones
    },
    // Límite estricto para auth
    {
      name: 'auth',
      ttl: 900000, // 15 minutos
      limit: 5, // 5 intentos
    },
    // Límite para admin
    {
      name: 'admin',
      ttl: 60000, // 60 segundos
      limit: 50, // 50 peticiones
    },
  ],
}

/**
 * Decoradores de rate limiting por endpoint
 */
export const THROTTLER_LIMITS = {
  DEFAULT: { throttler: { default: {} } },
  AUTH: { throttler: { auth: {} } },
  ADMIN: { throttler: { admin: {} } },
  SKIP: { skipThrottle: true },
}
