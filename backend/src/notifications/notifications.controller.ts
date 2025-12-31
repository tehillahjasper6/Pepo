import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private notificationsService: NotificationsService,
    private pushService: PushNotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  async getNotifications(@Request() req, @Query('limit') limit?: number) {
    return this.notificationsService.getUserNotifications(req.user.id, limit);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.id);
    return { count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @Request() req) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Put('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }

  @Get('vapid-key')
  @ApiOperation({ summary: 'Get VAPID public key for push notifications' })
  async getVapidKey() {
    return { publicKey: this.pushService.getVapidPublicKey() };
  }

  @Post('register-device')
  @ApiOperation({ summary: 'Register device for push notifications' })
  async registerDevice(@Request() req, @Body() body: { subscription: any }) {
    return this.pushService.registerDevice(req.user.id, body.subscription);
  }

  @Post('unregister-device')
  @ApiOperation({ summary: 'Unregister device from push notifications' })
  async unregisterDevice(@Request() req, @Body() body: { subscription: any }) {
    return this.pushService.unregisterDevice(req.user.id, body.subscription);
  }
}

