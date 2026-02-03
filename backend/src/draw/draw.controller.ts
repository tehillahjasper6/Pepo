import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DrawService } from './draw.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('draw')
@Controller('draw')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DrawController {
  constructor(private drawService: DrawService) {}

  @Post(':giveawayId/close')
  @ApiOperation({ summary: 'Close draw and select winners - CORE FEATURE' })
  async closeDrawAndSelectWinners(@Param('giveawayId') giveawayId: string, @Request() req) {
    return this.drawService.closeDrawAndSelectWinners(giveawayId, req.user.userId);
  }

  @Get(':giveawayId/results')
  @ApiOperation({ summary: 'Get draw results' })
  async getDrawResults(@Param('giveawayId') giveawayId: string) {
    return this.drawService.getDrawResults(giveawayId);
  }
}




