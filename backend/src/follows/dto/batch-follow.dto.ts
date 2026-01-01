import { IsArray, IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BatchFollowDto {
  @ApiProperty({
    description: 'Array of NGO IDs',
    example: ['ngo-1', 'ngo-2', 'ngo-3'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ngoIds: string[];

  @ApiProperty({
    description: 'Action to perform',
    example: 'follow',
    enum: ['follow', 'unfollow'],
  })
  @IsIn(['follow', 'unfollow'])
  action: 'follow' | 'unfollow';
}
