import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowSuggestionService } from './follow-suggestion.service';

@ApiTags('Follow Suggestions')
@Controller('api/suggestions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FollowSuggestionController {
  constructor(private followSuggestionService: FollowSuggestionService) {}

  /**
   * Get follow suggestions for current user
   */
  @Get()
  @ApiOperation({ summary: 'Get follow suggestions' })
  @ApiResponse({ status: 200, description: 'List of suggestions' })
  async getSuggestions(
    @Req() req: any,
    @Query('limit') limit?: number,
    @Query('includeExpired') includeExpired?: string,
  ) {
    return this.followSuggestionService.getSuggestionsForUser(req.user.id, {
      limit: limit ? Math.min(limit, 50) : 10,
      includeExpired: includeExpired === 'true',
    });
  }

  /**
   * Generate new suggestions for current user
   */
  @Post('refresh')
  @ApiOperation({ summary: 'Generate fresh suggestions' })
  @ApiResponse({ status: 200, description: 'Suggestions generated' })
  async refreshSuggestions(@Req() req: any) {
    const suggestions =
      await this.followSuggestionService.generateSuggestionsForUser(
        req.user.id,
      );
    return {
      count: suggestions.length,
      suggestions,
    };
  }

  /**
   * Mark suggestion as viewed
   */
  @Put(':suggestionId/view')
  @ApiOperation({ summary: 'Mark suggestion as viewed' })
  @ApiResponse({ status: 200, description: 'Marked as viewed' })
  async viewSuggestion(@Param('suggestionId') suggestionId: string) {
    return this.followSuggestionService.markSuggestionAsViewed(suggestionId);
  }

  /**
   * Follow NGO from suggestion
   */
  @Post(':suggestionId/follow')
  @ApiOperation({ summary: 'Follow NGO from suggestion' })
  @ApiResponse({ status: 200, description: 'NGO followed' })
  async followFromSuggestion(
    @Param('suggestionId') suggestionId: string,
    @Req() req: any,
  ) {
    // Mark suggestion as followed
    await this.followSuggestionService.markSuggestionAsFollowed(suggestionId);

    // Get the suggestion to find the NGO ID
    const suggestions = await this.followSuggestionService.getSuggestionsForUser(
      req.user.id,
      { includeExpired: true },
    );

    const suggestion = suggestions.find((s) => s.id === suggestionId);

    if (!suggestion) {
      return { success: false, message: 'Suggestion not found' };
    }

    // Follow the NGO (this would be handled by the Follow service)
    return {
      success: true,
      message: 'NGO followed',
      ngoId: suggestion.suggestedNGOId,
    };
  }

  /**
   * Ignore suggestion
   */
  @Put(':suggestionId/ignore')
  @ApiOperation({ summary: 'Ignore suggestion' })
  @ApiResponse({ status: 200, description: 'Suggestion ignored' })
  async ignoreSuggestion(@Param('suggestionId') suggestionId: string) {
    return this.followSuggestionService.markSuggestionAsIgnored(suggestionId);
  }

  /**
   * Get suggestion details
   */
  @Get(':suggestionId')
  @ApiOperation({ summary: 'Get suggestion details' })
  @ApiResponse({ status: 200, description: 'Suggestion details' })
  async getSuggestionDetails(@Param('suggestionId') suggestionId: string) {
    const suggestions = await this.followSuggestionService.getSuggestionsForUser(
      '', // Will be filtered by ID
      { includeExpired: true },
    );

    return suggestions.find((s) => s.id === suggestionId) || null;
  }
}
