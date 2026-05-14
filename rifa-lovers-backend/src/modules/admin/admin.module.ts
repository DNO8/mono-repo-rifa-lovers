import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { JobsModule } from '../jobs/jobs.module'
import { DrawModule } from '../draw/draw.module'
import { EmailModule } from '../email/email.module'

@Module({
  imports: [JobsModule, DrawModule, EmailModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
