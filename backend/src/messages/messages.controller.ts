import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('messages')
@Controller('messages')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: 'Send message (post-winner only)' })
  async sendMessage(@Request() req, @Body() body: { giveawayId: string; content: string }) {
    return this.messagesService.sendMessage(body.giveawayId, req.user.id, body.content);
  }

  @Get('giveaway/:giveawayId')
  @ApiOperation({ summary: 'Get messages for a giveaway' })
  async getMessages(@Param('giveawayId') giveawayId: string, @Request() req) {
    return this.messagesService.getMessages(giveawayId, req.user.id);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations' })
  async getConversations(@Request() req) {
    return this.messagesService.getUserConversations(req.user.id);
  }
}




