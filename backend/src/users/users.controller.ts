import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getMyProfile(@Request() req) {
    return this.usersService.getProfile(req.user.id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateMyProfile(@Request() req, @Body() body: any) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  async getMyStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }

  @Get('me/giveaways')
  @ApiOperation({ summary: 'Get my giveaways' })
  async getMyGiveaways(@Request() req) {
    return this.usersService.getUserGiveaways(req.user.id);
  }

  @Get('me/participations')
  @ApiOperation({ summary: 'Get my participations' })
  async getMyParticipations(@Request() req) {
    return this.usersService.getUserParticipations(req.user.id);
  }

  @Get('me/wins')
  @ApiOperation({ summary: 'Get my wins' })
  async getMyWins(@Request() req) {
    return this.usersService.getUserWins(req.user.id);
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile (public)' })
  async getUserProfile(@Param('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }
}



