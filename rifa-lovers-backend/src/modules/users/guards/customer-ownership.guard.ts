import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common'
import { RafflesRepository } from '../../raffles/raffles.repository'
import { LuckyPassRepository } from '../../lucky-pass/lucky-pass.repository'

@Injectable()
export class CustomerOwnershipGuard implements CanActivate {
  constructor(
    private readonly rafflesRepository: RafflesRepository,
    private readonly luckyPassRepository: LuckyPassRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as { id: string; role: string; organizationId: string | null } | null
    const params = request.params as { raffleId?: string; id?: string }
    const raffleId = params.raffleId || params.id

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado')
    }

    if (!['customer', 'operator', 'admin'].includes(user.role)) {
      throw new ForbiddenException('Acceso denegado: solo customers, operators y admins pueden acceder')
    }

    if (!raffleId) {
      return true // Si no hay raffleId, solo verificamos autenticación
    }

    // Verificar que la rifa existe
    const raffle = await this.rafflesRepository.findUnique(
      { id: raffleId },
      { organization: true },
    )
    const typedRaffle = raffle as { organizationId: string | null } | null

    if (!typedRaffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    // Admin: acceso libre a todas las rifas
    if (user.role === 'admin') {
      return true
    }

    // Operator: verificar que la rifa pertenezca a su organización
    if (user.role === 'operator') {
      const userDetails = await this.rafflesRepository.getUserById(user.id)
      if (!userDetails) {
        throw new NotFoundException('Usuario no encontrado')
      }

      if (userDetails.organizationId !== typedRaffle.organizationId) {
        throw new ForbiddenException('No puedes acceder a rifas que no pertenecen a tu organización')
      }

      return true
    }

    // Customer: verificar que haya comprado tickets (tenga LuckyPasses) en esta rifa
    if (user.role === 'customer') {
      const luckyPassCount = await this.luckyPassRepository.count({
        userId: user.id,
        raffleId,
      })

      if (luckyPassCount === 0) {
        throw new ForbiddenException('No has participado en esta rifa')
      }

      return true
    }

    return true
  }
}
