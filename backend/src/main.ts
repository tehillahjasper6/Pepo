import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppModule } from './app.module';

// Sentry for error tracking (commented out - package not installed)
// import * as Sentry from '@sentry/node';
// import * as Tracing from '@sentry/tracing';
import compression from 'compression';

async function bootstrap() {

  // Sentry initialization (disabled)
  // Sentry.init({
  //   dsn: process.env.SENTRY_DSN || '',
  //   tracesSampleRate: 1.0,
  //   environment: process.env.NODE_ENV || 'development',
  // });

  const app = await NestFactory.create(AppModule);

  // Compression middleware
  app.use(compression());

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS
  // CORS with security headers
  app.enableCors({
    origin: process.env.NODE_ENV === 'production'
      ? [
          process.env.WEB_URL || 'https://pepo.app',
          process.env.ADMIN_URL || 'https://admin.pepo.app',
        ]
      : [
          process.env.WEB_URL || 'http://localhost:3000',
          process.env.ADMIN_URL || 'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
        ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400, // 24 hours
  });

  // Additional security headers
  app.use((req, res, next) => {
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
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

