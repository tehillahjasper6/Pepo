import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { NeighborhoodCircleService } from './neighborhood-circle.service';

@Module({
  imports: [PrismaModule],
  providers: [NeighborhoodCircleService],
  exports: [NeighborhoodCircleService],
})
export class CommunityModule {}
