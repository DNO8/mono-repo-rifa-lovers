import { Injectable, Logger } from '@nestjs/common'
import { RafflesRepository } from './raffles.repository'

@Injectable()
export class RaffleSchedulerService {
  private readonly logger = new Logger(RaffleSchedulerService.name)

  constructor(private readonly rafflesRepository: RafflesRepository) {}

  /**
   * Cierra automáticamente las rifas activas cuyo endDate ha expirado
   * Este método se ejecuta periódicamente via job scheduler
   */
  async closeExpiredRaffles(): Promise<{ closed: number; errors: string[] }> {
    this.logger.debug('Verificando rifas expiradas para cierre automático')
    
    const errors: string[] = []
    let closed = 0

    try {
      // Buscar rifas activas con endDate <= ahora
      const expiredRaffles = await this.rafflesRepository.findActiveExpiredRaffles()
      
      this.logger.debug(`Found ${expiredRaffles.length} expired raffles to close`)

      for (const raffle of expiredRaffles) {
        try {
          await this.rafflesRepository.updateStatus(raffle.id, 'closed')
          closed++
          this.logger.log(`Raffle ${raffle.id} (${raffle.title}) cerrada automáticamente por endDate expirado`)
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          const errorMsg = `Error cerrando raffle ${raffle.id}: ${message}`
          this.logger.error(errorMsg)
          errors.push(errorMsg)
        }
      }

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      const errorMsg = `Error buscando rifas expiradas: ${message}`
      this.logger.error(errorMsg)
      errors.push(errorMsg)
    }

    this.logger.log(`Cierre automático completado: ${closed} rifas cerradas, ${errors.length} errores`)
    
    return { closed, errors }
  }
}
