import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { NGOTransparencyService } from '../ngo/ngo-transparency.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AdminController],
  providers: [AdminService, NGOTransparencyService],
  exports: [AdminService],
})
export class AdminModule {}

