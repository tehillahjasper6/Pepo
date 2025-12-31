import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: [
      process.env.WEB_URL || 'http://localhost:3000',
      process.env.ADMIN_URL || 'http://localhost:3001',
    ],
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Rate limiting is applied globally via ThrottlerGuard in AppModule

  // Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('PEPO API')
    .setDescription('Community-based giving and sharing platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('giveaways', 'Giveaway management')
    .addTag('participants', 'Participation in giveaways')
    .addTag('draw', 'Random draw system')
    .addTag('messages', 'In-app messaging')
    .addTag('ngo', 'NGO & charity features')
    .addTag('admin', 'Admin panel endpoints')
    .addTag('notifications', 'Push & in-app notifications')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║                                                          ║
  ║     🐝  PEPO API Server                                  ║
  ║     Give Freely. Live Lightly.                          ║
  ║                                                          ║
  ║     Server running on: http://localhost:${port}          ║
  ║     API Docs: http://localhost:${port}/api/docs          ║
  ║                                                          ║
  ╚══════════════════════════════════════════════════════════╝
  `);
}
bootstrap();

