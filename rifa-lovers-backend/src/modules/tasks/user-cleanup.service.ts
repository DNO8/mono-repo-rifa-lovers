import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../database/prisma.service'
import { SupabaseService } from '../../config/supabase.service'

@Injectable()
export class UserCleanupService {
  private readonly logger = new Logger(UserCleanupService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // Ejecutar cada hora
  @Cron('0 * * * *')
  async cleanupUnconfirmedUsers(): Promise<void> {
    this.logger.log('Starting cleanup of unconfirmed users...')

    try {
      // Obtener usuarios de Supabase que no han confirmado su email
      const { data: authUsers, error } = await this.supabaseService.listUnconfirmedUsers()

      if (error) {
        this.logger.error('Failed to list unconfirmed users from Supabase:', error.message)
        return
      }

      if (!authUsers || authUsers.length === 0) {
        this.logger.log('No unconfirmed users found')
        return
      }

      const now = new Date()
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000 // 24 horas en ms

      let deletedCount = 0

      for (const authUser of authUsers) {
        const createdAt = new Date(authUser.created_at)
        const timeSinceCreation = now.getTime() - createdAt.getTime()

        // Si tiene más de 24 horas sin confirmar, eliminar
        if (timeSinceCreation > TWENTY_FOUR_HOURS) {
          this.logger.log(`Deleting unconfirmed user: ${authUser.id} (created at ${createdAt.toISOString()})`)

          // Eliminar de Supabase Auth
          const { error: deleteError } = await this.supabaseService.deleteUser(authUser.id)

          if (deleteError) {
            this.logger.error(`Failed to delete user ${authUser.id} from Supabase:`, deleteError.message)
            continue
          }

          // Eliminar de la base de datos local
          await this.prisma.user.deleteMany({
            where: { id: authUser.id },
          })

          deletedCount++
        }
      }

      this.logger.log(`Cleanup completed. Deleted ${deletedCount} unconfirmed users.`)
    } catch (error) {
      this.logger.error('Error during user cleanup:', error)
    }
  }
}
