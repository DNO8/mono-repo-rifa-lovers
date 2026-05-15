import type { User } from '@prisma/client'
import type { UserResponseDto } from '../dto'

export function mapUserToDto(user: User & { organization?: { name: string } | null }): UserResponseDto {
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
  }
}
