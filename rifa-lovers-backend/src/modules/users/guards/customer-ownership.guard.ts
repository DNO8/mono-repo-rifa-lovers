import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common'
import { RafflesRepository } from '../../raffles/raffles.repository'

@Injectable()
export class CustomerOwnershipGuard implements CanActivate {
  constructor(private readonly rafflesRepository: RafflesRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const user = request.user as { id: string; role: string; organizationId: string | null } | null
    const params = request.params as { raffleId?: string; id?: string }
    const raffleId = params.raffleId || params.id

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado')
    }

    if (user.role !== 'customer') {
      throw new ForbiddenException('Acceso denegado: solo customers pueden acceder')
    }

    if (!raffleId) {
      return true // Si no hay raffleId, solo verificamos que sea customer
    }

    // Verificar que la rifa existe y pertenece a la organización del customer
    const raffle = await this.rafflesRepository.findUnique(
      { id: raffleId },
      { organization: true },
    )
    const typedRaffle = raffle as { organizationId: string | null } | null

    if (!typedRaffle) {
      throw new NotFoundException('Rifa no encontrada')
    }

    // Obtener detalles del usuario para verificar organizationId
    const userDetails = await this.rafflesRepository.getUserById(user.id)
    if (!userDetails) {
      throw new NotFoundException('Usuario no encontrado')
    }

    if (userDetails.organizationId !== typedRaffle.organizationId) {
      throw new ForbiddenException('No puedes acceder a rifas que no pertenecen a tu organización')
    }

    return true
  }
}
