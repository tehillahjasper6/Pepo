import { Module } from '@nestjs/common';
import { FollowSuggestionService } from './follow-suggestion.service';
import { FollowSuggestionController } from './follow-suggestion.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FollowSuggestionController],
  providers: [FollowSuggestionService],
  exports: [FollowSuggestionService],
})
export class FollowSuggestionModule {}
