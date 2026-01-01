import { IsBoolean, IsArray, IsEnum, IsOptional } from 'class-validator';
import { DigestFrequency, DigestChannel } from '@prisma/client';

/**
 * DTO for creating or updating user digest preferences
 * Validates all digest-related preferences against JSON schema constraints
 */
export class UpdateDigestPreferenceDto {
  /**
   * Digest delivery frequency
   * JSON reference: digest_frequencies
   * Allowed values: DAILY, WEEKLY
   */
  @IsOptional()
  @IsEnum(DigestFrequency, {
    message: `frequency must be one of: ${Object.values(DigestFrequency).join(', ')}`,
  })
  frequency?: DigestFrequency;

  /**
   * Whether digest is enabled
   * Allows users to opt-in/opt-out
   */
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  /**
   * Delivery channels
   * JSON reference: digest_channels
   * Allowed values: IN_APP, EMAIL, PUSH
   */
  @IsOptional()
  @IsArray()
  @IsEnum(DigestChannel, { each: true })
  channels?: DigestChannel[];

  /**
   * Include new NGO item posts in digest
   * JSON reference: digest_content_scope
   */
  @IsOptional()
  @IsBoolean()
  includeNewPosts?: boolean;

  /**
   * Include upcoming campaigns in digest
   * JSON reference: digest_content_scope
   */
  @IsOptional()
  @IsBoolean()
  includeCampaigns?: boolean;

  /**
   * Include completed giveaways in digest
   * JSON reference: digest_content_scope
   */
  @IsOptional()
  @IsBoolean()
  includeCompleted?: boolean;
}

/**
 * DTO for digest frequency update
 */
export class UpdateDigestFrequencyDto {
  @IsEnum(DigestFrequency, {
    message: `frequency must be one of: ${Object.values(DigestFrequency).join(', ')}`,
  })
  frequency: DigestFrequency;
}

/**
 * DTO for digest channels update
 */
export class UpdateDigestChannelsDto {
  @IsArray()
  @IsEnum(DigestChannel, { each: true })
  channels: DigestChannel[];
}

/**
 * DTO for digest toggle
 */
export class ToggleDigestDto {
  @IsBoolean()
  isEnabled: boolean;
}

/**
 * DTO for content scope update
 */
export class UpdateContentScopeDto {
  @IsOptional()
  @IsBoolean()
  includeNewPosts?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCampaigns?: boolean;

  @IsOptional()
  @IsBoolean()
  includeCompleted?: boolean;
}

/**
 * Response DTO for digest preferences
 */
export class DigestPreferenceResponseDto {
  id: string;
  userId: string;
  frequency: DigestFrequency;
  isEnabled: boolean;
  channels: DigestChannel[];
  lastDigestSentAt?: Date;
  nextScheduledAt?: Date;
  includeNewPosts: boolean;
  includeCampaigns: boolean;
  includeCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
