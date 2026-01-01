import { IsOptional, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FollowFilterDto {
  @ApiProperty({
    description: 'Filter by NGO category',
    example: 'health',
    required: false,
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({
    description: 'Sort by field',
    example: 'followedAt',
    enum: ['name', 'followedAt', 'impactScore'],
    required: false,
  })
  @IsOptional()
  @IsIn(['name', 'followedAt', 'impactScore'])
  sortBy?: 'name' | 'followedAt' | 'impactScore' = 'followedAt';

  @ApiProperty({
    description: 'Search by NGO name',
    example: 'Red Cross',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
