import { Module } from '@nestjs/common'
import { AdminController } from './admin.controller'
import { AdminService } from './admin.service'
import { JobsModule } from '../jobs/jobs.module'
import { DrawModule } from '../draw/draw.module'

@Module({
  imports: [JobsModule, DrawModule],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
