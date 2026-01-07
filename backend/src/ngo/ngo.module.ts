import { Module } from '@nestjs/common';
import { NGOService } from './ngo.service';
import { NGOController } from './ngo.controller';
import { NGOTrustService } from './ngo-trust.service';
import { NGOTransparencyService } from './ngo-transparency.service';
import { NGOTrustController } from './ngo-trust.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, NotificationsModule],
  controllers: [NGOController, NGOTrustController],
  providers: [NGOService, NGOTrustService, NGOTransparencyService],
  exports: [NGOService, NGOTrustService, NGOTransparencyService],
})
export class NGOModule {}

