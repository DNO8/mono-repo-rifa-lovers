import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../../database/prisma.service'

/**
 * Guard that enforces idempotency by checking the X-Idempotency-Key header.
 * If a matching non-expired record exists, it throws ConflictException with
 * the cached response so the interceptor can catch it and replay.
 */
@Injectable()
export class IdempotencyGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const key = request.headers['x-idempotency-key'] as string | undefined

    if (!key) {
      // Allow requests without idempotency key (backward compatibility)
      return true
    }

    request.idempotencyKey = key

    const existing = await this.prisma.idempotencyRecord.findUnique({
      where: { key },
    })

    if (existing && existing.expiresAt > new Date()) {
      // Attach cached response to the request so the interceptor
      // can short-circuit and return it instead of re-executing.
      request.idempotencyCache = existing
      return true
    }

    return true
  }
}
