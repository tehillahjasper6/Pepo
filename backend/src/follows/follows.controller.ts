import { Controller, Post, Delete, UseGuards, Request, Param, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FollowsService } from './follows.service';

@ApiTags('follows')
@Controller('follows')
export class FollowsController {
  constructor(private followsService: FollowsService) {}

  @Post('ngo/:ngoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async follow(@Request() req, @Param('ngoId') ngoId: string) {
    return this.followsService.follow(req.user.id, ngoId);
  }

  @Delete('ngo/:ngoId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async unfollow(@Request() req, @Param('ngoId') ngoId: string) {
    return this.followsService.unfollow(req.user.id, ngoId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async myFollows(@Request() req) {
    return this.followsService.listFollowedNGOs(req.user.id);
  }
}
