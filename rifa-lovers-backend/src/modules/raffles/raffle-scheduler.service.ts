import { Injectable } from '@nestjs/common'
import { RafflesRepository } from './raffles.repository'

@Injectable()
export class RaffleSchedulerService {

  constructor(private readonly rafflesRepository: RafflesRepository) {}

  /**
   * Cierra automáticamente las rifas activas cuyo endDate ha expirado
   * Este método se ejecuta periódicamente via job scheduler
   */
  async closeExpiredRaffles(): Promise<{ closed: number; errors: string[] }> {
    
    const errors: string[] = []
    let closed = 0

    try {
      // Buscar rifas activas con endDate <= ahora
      const expiredRaffles = await this.rafflesRepository.findActiveExpiredRaffles()
      

      for (const raffle of expiredRaffles) {
        try {
          await this.rafflesRepository.updateStatus(raffle.id, 'closed')
          closed++
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          const errorMsg = `Error cerrando raffle ${raffle.id}: ${message}`
          errors.push(errorMsg)
        }
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const errorMsg = `Error buscando rifas expiradas: ${message}`
      errors.push(errorMsg)
    }

    
    return { closed, errors }
  }
}
