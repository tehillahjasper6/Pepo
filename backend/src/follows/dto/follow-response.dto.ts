import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MuteNGODto {
  @ApiProperty({
    description: 'Reason for muting (optional)',
    example: 'Not interested in this organization',
    required: false,
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class FollowResponseDto {
  @ApiProperty({ example: 'follow-uuid' })
  id: string;

  @ApiProperty({ example: 'ngo-uuid' })
  userId: string;

  @ApiProperty({ example: 'ngo-uuid' })
  ngoId: string;

  @ApiProperty({ example: '2026-01-01T00:00:00Z' })
  createdAt: Date;

  ngo?: {
    id: string;
    name: string;
    impactScore?: number;
  };
}

export class FollowStatusDto {
  @ApiProperty({ example: 'ngo-uuid' })
  ngoId: string;

  @ApiProperty({ example: true })
  isFollowing: boolean;

  @ApiProperty({ example: false })
  isMuted: boolean;

  @ApiProperty({ example: 1000 })
  totalFollowers?: number;
}

export class PaginatedFollowsDto {
  @ApiProperty({ type: [FollowResponseDto] })
  data: FollowResponseDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 20 },
      total: { type: 'number', example: 100 },
      pages: { type: 'number', example: 5 },
    },
  })
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export class BatchFollowResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 3 })
  created?: number;

  @ApiProperty({ example: 2 })
  deleted?: number;

  @ApiProperty({ example: 'Successfully followed 3 NGOs' })
  message: string;
}

export class TrendingNGODto {
  @ApiProperty({ example: 'ngo-uuid' })
  id: string;

  @ApiProperty({ example: 'Red Cross' })
  name: string;

  @ApiProperty({ example: 0.95 })
  impactScore?: number;

  @ApiProperty({ example: 5000 })
  followerCount: number;

  @ApiProperty({ example: 'health' })
  category: string;

  @ApiProperty({ example: 250 })
  recentFollows?: number;
}
