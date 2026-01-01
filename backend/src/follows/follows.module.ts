import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [CacheModule.register()],
  controllers: [FollowsController],
  providers: [FollowsService, PrismaService],
  exports: [FollowsService],
})
export class FollowsModule {}
