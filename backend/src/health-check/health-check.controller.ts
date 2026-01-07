import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PrismaService } from '../prisma/prisma.service'

/**
 * Health check endpoints for monitoring
 */
@ApiTags('health')
@Controller('health')
export class HealthCheckController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    }
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check (includes database check)' })
  async getReadiness() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`

      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
      }
    } catch (error) {
      return {
        status: 'not-ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      }
    }
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check' })
  getLive() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    }
  }
}
