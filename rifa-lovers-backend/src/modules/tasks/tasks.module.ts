import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { UserCleanupService } from './user-cleanup.service'
import { SupabaseService } from '../../config/supabase.service'
import { PrismaService } from '../../database/prisma.service'

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [UserCleanupService, SupabaseService, PrismaService],
})
export class TasksModule {}
