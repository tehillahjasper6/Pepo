import { Module } from '@nestjs/common';
import { MessagesGateway } from './websocket.gateway';
import { MessagesModule } from '../messages/messages.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MessagesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
    }),
  ],
  providers: [MessagesGateway],
  exports: [MessagesGateway],
})
export class WebSocketModule {}



