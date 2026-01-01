import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO for follow suggestion retrieval options
 * Validates parameters for intelligent suggestion filtering
 * JSON reference: suggestion_signals, confidence_weights
 */
export class GetFollowSuggestionsQueryDto {
  /**
   * Maximum number of suggestions to return
   * JSON reference: maxSuggestionsPerUser default: 20
   */
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number;

  /**
   * Include expired suggestions in results
   * JSON reference: suggestionExpiryDays default: 30
   */
  @IsOptional()
  @IsBoolean()
  includeExpired?: boolean;
}

/**
 * Response DTO for a single follow suggestion
 */
export class FollowSuggestionDto {
  id: string;
  userId: string;
  suggestedNGOId: string;
  
  // NGO Details
  ngo: {
    id: string;
    organizationName: string;
    status: string;
    logo?: string;
    missionStatement?: string;
    focusAreas: string[];
    trustScore: number;
  };

  /**
   * Weighted confidence score (0-1)
   * Calculated from JSON schema: SIGNAL_CONFIG.signals
   * - popularity: 0.2 weight
   * - category_match: 0.25 weight
   * - location_proximity: 0.15 weight
   * - participation_history: 0.25 weight
   * - trust_score: 0.15 weight
   */
  confidenceScore: number;

  /**
   * Human-readable reason for suggestion
   * Generated from top 2 signal scores
   */
  reason?: string;

  /**
   * Weighted signal breakdown
   * Maps signal names to individual scores
   */
  signalWeight?: {
    popularity: number;
    category_match: number;
    location_proximity: number;
    participation_history: number;
    trust_score: number;
  };

  // User interaction tracking
  isViewed: boolean;
  isFollowed: boolean;
  isIgnored: boolean;
  viewedAt?: Date;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Response DTO for suggestion list
 */
export class FollowSuggestionsListDto {
  count: number;
  suggestions: FollowSuggestionDto[];
}

/**
 * Response DTO for suggestion actions (view, follow, ignore)
 */
export class SuggestionActionResponseDto {
  success: boolean;
  message: string;
  suggestionId: string;
  timestamp: Date;
}

/**
 * Response DTO for suggestion refresh/generation
 */
export class SuggestionRefreshResponseDto {
  success: boolean;
  count: number;
  message: string;
  generatedAt: Date;
  expiresAt: Date;
  suggestions: FollowSuggestionDto[];
}
