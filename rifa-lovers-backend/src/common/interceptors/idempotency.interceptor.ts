import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  HttpException,
} from '@nestjs/common'
import { Observable, of, tap } from 'rxjs'
import { PrismaService } from '../../database/prisma.service'

const IDEMPOTENCY_TTL_MINUTES = 30

/**
 * Interceptor that caches successful responses keyed by X-Idempotency-Key.
 * When a subsequent request arrives with the same key, the interceptor
 * replays the cached response (status + body) instead of re-executing.
 */
@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest()
    const key = request.idempotencyKey as string | undefined
    const cached = request.idempotencyCache as { statusCode: number; responseBody: string | null } | undefined

    // If we already have a cached record from the guard, replay it
    if (cached) {
      return of(this.replay(cached))
    }

    // No idempotency key means normal flow
    if (!key) {
      return next.handle()
    }

    const method = request.method
    const endpoint = request.url

    return next.handle().pipe(
      tap(async (data) => {
        const response = context.switchToHttp().getResponse()
        const statusCode = response.statusCode as number

        // Only cache successful responses (2xx)
        if (statusCode >= 200 && statusCode < 300) {
          const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MINUTES * 60_000)
          try {
            await this.prisma.idempotencyRecord.upsert({
              where: { key },
              create: {
                key,
                endpoint,
                httpMethod: method,
                statusCode,
                responseBody: data ? JSON.stringify(data) : null,
                expiresAt,
              },
              update: {
                endpoint,
                httpMethod: method,
                statusCode,
                responseBody: data ? JSON.stringify(data) : null,
                expiresAt,
              },
            })
          } catch {
            // If caching fails we still return the original response
          }
        }
      }),
    )
  }

  private replay(cached: { statusCode: number; responseBody: string | null }): unknown {
    if (cached.responseBody) {
      try {
        return JSON.parse(cached.responseBody)
      } catch {
        return cached.responseBody
      }
    }
    return undefined
  }
}
