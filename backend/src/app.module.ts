import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GiveawaysModule } from './giveaways/giveaways.module';
import { DrawModule } from './draw/draw.module';
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
import { NGOModule } from './ngo/ngo.module';
import { AdminModule } from './admin/admin.module';
import { BadgesModule } from './badges/badges.module';
import { TrustModule } from './trust/trust.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { RedisModule } from './redis/redis.module';
import { WebSocketModule } from './websocket/websocket.module';
import { WorkersModule } from './workers/workers.module';
import { DigestModule } from './digests/digest.module';
import { CampaignReminderModule } from './campaign-reminders/campaign-reminder.module';
import { FollowSuggestionModule } from './follow-suggestions/follow-suggestion.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute (general API)
      },
      {
        name: 'strict',
        ttl: 60000, // 1 minute
        limit: 10, // 10 requests per minute (auth endpoints)
      },
      {
        name: 'upload',
        ttl: 60000, // 1 minute
        limit: 5, // 5 uploads per minute
      },
    ]),
    PrismaModule,
    RedisModule,
    CloudinaryModule,
    AuthModule,
    UsersModule,
    GiveawaysModule,
    DrawModule,
    MessagesModule,
    NotificationsModule,
    NGOModule,
    AdminModule,
    BadgesModule,
    TrustModule,
    WebSocketModule,
    WorkersModule,
    DigestModule,
    CampaignReminderModule,
    FollowSuggestionModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

