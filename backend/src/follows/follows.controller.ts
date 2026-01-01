import {
  Controller,
  Post,
  Delete,
  UseGuards,
  Request,
  Param,
  Get,
  Query,
  Body,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { validate as uuidValidate } from 'uuid';
import { FollowsService } from './follows.service';
import { PaginationDto } from './dto/pagination.dto';
import { FollowFilterDto } from './dto/follow-filter.dto';
import { BatchFollowDto, MuteNGODto } from './dto/follow-response.dto';

/**
 * FollowsController
 * Manages follow relationships between users and NGOs
 * Provides endpoints for following, unfollowing, discovering trending NGOs, and personalized suggestions
 */
@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  // ════════════════════════════════════════════════════════════════════════════
  // Basic Follow/Unfollow Operations
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Follow an NGO
   * @param req Express request with authenticated user
   * @param ngoId NGO ID to follow
   * @returns Follow record with NGO details
   */
  @Post('ngos/:ngoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Follow an NGO' })
  @ApiResponse({ status: 201, description: 'Successfully followed NGO' })
  @ApiResponse({ status: 400, description: 'Invalid NGO ID or already following' })
  @HttpCode(HttpStatus.CREATED)
  async follow(@Request() req, @Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.follow(req.user.id, ngoId);
  }

  /**
   * Unfollow an NGO
   * @param req Express request with authenticated user
   * @param ngoId NGO ID to unfollow
   * @returns Unfollow confirmation
   */
  @Delete('ngos/:ngoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 10, ttl: 60 } })
  @ApiOperation({ summary: 'Unfollow an NGO' })
  @ApiResponse({ status: 200, description: 'Successfully unfollowed NGO' })
  @ApiResponse({ status: 400, description: 'Not following this NGO' })
  @HttpCode(HttpStatus.OK)
  async unfollow(@Request() req, @Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.unfollow(req.user.id, ngoId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // List & Query Operations
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get all NGOs followed by the current user
   * Supports pagination, filtering, and sorting
   * @param req Express request with authenticated user
   * @param pagination Page and limit query params
   * @param filters Category, sort, search filters
   * @returns Paginated list of followed NGOs
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get my followed NGOs',
    description: 'Get all NGOs followed by the current user with pagination and filtering',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'followedAt', 'impactScore'] })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Paginated list of followed NGOs' })
  async getMyFollows(
    @Request() req,
    @Query() pagination: PaginationDto,
    @Query() filters: FollowFilterDto,
  ) {
    return this.followsService.listFollowedNGOs(req.user.id, pagination, filters);
  }

  /**
   * Check follow status for a specific NGO
   * @param req Express request with authenticated user
   * @param ngoId NGO ID to check
   * @returns Follow and mute status
   */
  @Get('ngos/:ngoId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Check if following an NGO' })
  @ApiResponse({ status: 200, description: 'Follow and mute status' })
  async getFollowStatus(@Request() req, @Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.isFollowing(req.user.id, ngoId);
  }

  /**
   * Get count of NGOs followed by user
   * @param req Express request with authenticated user
   */
  @Get('count/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get count of NGOs I follow' })
  @ApiResponse({ status: 200, description: 'Follow count' })
  async getMyFollowCount(@Request() req) {
    return this.followsService.getUserFollowsCount(req.user.id);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Discovery & Recommendations
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get trending NGOs based on recent follows and impact score
   * @param limit Number of results (1-20)
   * @returns Trending NGOs
   */
  @Get('trending')
  @ApiOperation({
    summary: 'Get trending NGOs',
    description: 'Get NGOs with high follower momentum in the last 30 days',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of trending NGOs' })
  async getTrendingNGOs(@Query('limit') limit?: number) {
    const safeLimit = Math.min(limit || 10, 20);
    return this.followsService.getTrendingNGOs(safeLimit);
  }

  /**
   * Get personalized NGO suggestions for the current user
   * Based on their follow history and category preferences
   * @param req Express request with authenticated user
   * @param limit Number of suggestions
   * @returns Suggested NGOs with reasons
   */
  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get suggested NGOs',
    description: 'Get personalized NGO recommendations based on your follow history',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({ status: 200, description: 'List of suggested NGOs' })
  async getSuggestions(@Request() req, @Query('limit') limit?: number) {
    const safeLimit = Math.min(limit || 10, 20);
    return this.followsService.getSuggestionsForUser(req.user.id, safeLimit);
  }

  /**
   * Get users who follow the same NGO (mutual followers)
   * @param req Express request with authenticated user
   * @param ngoId NGO ID
   * @returns List of mutual followers
   */
  @Get('ngos/:ngoId/mutual')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get mutual followers',
    description: 'Get users who follow the same NGO as you',
  })
  @ApiResponse({ status: 200, description: 'List of mutual followers' })
  async getMutualFollows(@Request() req, @Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.getMutualFollows(req.user.id, ngoId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Batch Operations
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Batch follow or unfollow multiple NGOs
   * Reduces API calls for bulk operations
   * @param req Express request with authenticated user
   * @param body Array of NGO IDs and action
   * @returns Operation result with count
   */
  @Post('batch')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60 } })
  @ApiOperation({
    summary: 'Batch follow/unfollow',
    description: 'Follow or unfollow multiple NGOs at once (max 50)',
  })
  @ApiResponse({ status: 201, description: 'Batch operation completed' })
  @ApiResponse({ status: 400, description: 'Invalid batch size or NGO IDs' })
  @HttpCode(HttpStatus.CREATED)
  async batchFollow(@Request() req, @Body() body: BatchFollowDto) {
    if (!body.ngoIds || !Array.isArray(body.ngoIds)) {
      throw new BadRequestException('ngoIds must be an array');
    }
    body.ngoIds.forEach(id => this.validateUUID(id));
    return this.followsService.batchFollow(req.user.id, body.ngoIds, body.action);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Mute/Unmute Operations
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Mute an NGO (hides from recommendations but keeps follow)
   * @param req Express request with authenticated user
   * @param ngoId NGO ID to mute
   * @param body Optional mute reason
   */
  @Post('ngos/:ngoId/mute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Mute an NGO',
    description: 'Hide NGO from recommendations while keeping the follow',
  })
  @ApiResponse({ status: 200, description: 'NGO muted' })
  @HttpCode(HttpStatus.OK)
  async muteNGO(
    @Request() req,
    @Param('ngoId') ngoId: string,
    @Body() body?: MuteNGODto,
  ) {
    this.validateUUID(ngoId);
    return this.followsService.muteNGO(req.user.id, ngoId, body?.reason);
  }

  /**
   * Unmute an NGO (restore to recommendations)
   * @param req Express request with authenticated user
   * @param ngoId NGO ID to unmute
   */
  @Delete('ngos/:ngoId/mute')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unmute an NGO',
    description: 'Restore NGO to recommendations',
  })
  @ApiResponse({ status: 200, description: 'NGO unmuted' })
  @HttpCode(HttpStatus.OK)
  async unmuteNGO(@Request() req, @Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.unmuteNGO(req.user.id, ngoId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // NGO Statistics
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Get follower count for an NGO
   * @param ngoId NGO ID
   */
  @Get('ngos/:ngoId/count')
  @ApiOperation({ summary: 'Get NGO follower count' })
  @ApiResponse({ status: 200, description: 'Follower count' })
  async getNGOFollowersCount(@Param('ngoId') ngoId: string) {
    this.validateUUID(ngoId);
    return this.followsService.getNGOFollowersCount(ngoId);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Deprecated endpoints kept for backward compatibility
  // ════════════════════════════════════════════════════════════════════════════

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Deprecated()
  async myFollows(@Request() req) {
    return this.followsService.listFollowedNGOs(req.user.id);
  }

  // ════════════════════════════════════════════════════════════════════════════
  // Helper methods
  // ════════════════════════════════════════════════════════════════════════════

  private validateUUID(id: string): void {
    if (!uuidValidate(id)) {
      throw new BadRequestException(`Invalid UUID format: ${id}`);
    }
  }
}
