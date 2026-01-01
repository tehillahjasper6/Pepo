import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BadgesController],
})
export class BadgesModule {}
