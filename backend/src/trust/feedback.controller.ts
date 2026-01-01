import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FeedbackService } from '../trust/feedback.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/feedback')
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private feedbackService: FeedbackService) {}

  /**
   * POST /api/feedback - Submit feedback after giveaway
   */
  @Post()
  async submitFeedback(@Request() req: any, @Body() body: any) {
    const { receiverId, giveawayId, itemCondition, communicationQuality, wouldRecommend, rating, comments } = body;
    
    return this.feedbackService.submitFeedback(
      req.user.id, // giverId from JWT
      receiverId,
      giveawayId,
      {
        itemCondition,
        communicationQuality,
        wouldRecommend,
        rating,
        comments,
      },
    );
  }

  /**
   * GET /api/feedback/given/:userId - Get feedback given by user
   */
  @Get('given/:userId')
  async getGivenFeedback(@Param('userId') userId: string) {
    return this.feedbackService.getUserFeedback(userId, 'given');
  }

  /**
   * GET /api/feedback/received/:userId - Get feedback received by user
   */
  @Get('received/:userId')
  async getReceivedFeedback(@Param('userId') userId: string) {
    return this.feedbackService.getUserFeedback(userId, 'received');
  }

  /**
   * GET /api/feedback/stats/:userId - Get feedback statistics for user
   */
  @Get('stats/:userId')
  async getFeedbackStats(@Param('userId') userId: string) {
    return this.feedbackService.getFeedbackStats(userId);
  }
}
