import { Injectable, OnModuleInit, Logger } from '@nestjs/common'

/**
 * Service to validate required environment variables on application startup
 */
@Injectable()
export class EnvironmentValidationService implements OnModuleInit {
  private readonly logger = new Logger(EnvironmentValidationService.name)

  private readonly requiredVariables = [
    'DATABASE_URL',
    'JWT_SECRET',
    'NODE_ENV',
  ]

  private readonly optionalVariables = [
    'REDIS_HOST',
    'REDIS_PORT',
    'SENDGRID_API_KEY',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'FIREBASE_PROJECT_ID',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
  ]

  onModuleInit() {
    this.validateEnvironment()
  }

  private validateEnvironment(): void {
    this.logger.log('Validating environment variables...')

    const missingRequired = this.requiredVariables.filter(
      (variable) => !process.env[variable]
    )

    if (missingRequired.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingRequired.join(', ')}`
      this.logger.error(errorMessage)
      throw new Error(errorMessage)
    }

    const configured = this.optionalVariables.filter(
      (variable) => process.env[variable]
    )

    this.logger.log(
      `✓ All required environment variables configured`
    )
    this.logger.log(
      `✓ Optional variables configured: ${configured.length}/${this.optionalVariables.length}`
    )

    // Log environment (without sensitive values)
    this.logger.log(`Environment: ${process.env.NODE_ENV}`)
    this.logger.log(
      `Database: ${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'N/A'}`
    )
    this.logger.log(
      `Redis: ${process.env.REDIS_HOST || 'Not configured'}`
    )
  }

  /**
   * Get all configured variables for health checks
   */
  getEnvironmentStatus() {
    return {
      required: this.requiredVariables.every((v) => process.env[v]),
      optional: this.optionalVariables.filter((v) => process.env[v]),
      environment: process.env.NODE_ENV,
    }
  }
}
