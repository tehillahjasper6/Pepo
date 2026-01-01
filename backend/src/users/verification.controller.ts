import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api/verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private verificationService: VerificationService) {}

  /**
   * GET /api/verification/status - Get user verification status
   */
  @Get('status')
  async getVerificationStatus(@Request() req: any) {
    return this.verificationService.getUserVerificationStatus(req.user.id);
  }

  /**
   * GET /api/verification/badge - Get verification badges
   */
  @Get('badge')
  async getVerificationBadge(@Request() req: any) {
    return this.verificationService.getVerificationBadge(req.user.id);
  }

  /**
   * POST /api/verification/email/start - Start email verification
   */
  @Post('email/start')
  async startEmailVerification(@Request() req: any, @Body() body: { email: string }) {
    return this.verificationService.startEmailVerification(req.user.id, body.email);
  }

  /**
   * POST /api/verification/email/verify - Verify email code
   */
  @Post('email/verify')
  async verifyEmail(@Request() req: any, @Body() body: { code: string }) {
    return this.verificationService.verifyEmail(req.user.id, body.code);
  }

  /**
   * POST /api/verification/phone/start - Start phone verification
   */
  @Post('phone/start')
  async startPhoneVerification(@Request() req: any, @Body() body: { phone: string }) {
    return this.verificationService.startPhoneVerification(req.user.id, body.phone);
  }

  /**
   * POST /api/verification/phone/verify - Verify phone OTP
   */
  @Post('phone/verify')
  async verifyPhone(@Request() req: any, @Body() body: { code: string }) {
    return this.verificationService.verifyPhone(req.user.id, body.code);
  }

  /**
   * POST /api/verification/id/start - Start ID document verification
   */
  @Post('id/start')
  async startIDVerification(@Request() req: any, @Body() body: { documentType: string }) {
    return this.verificationService.startIDVerification(req.user.id, body.documentType);
  }

  /**
   * POST /api/verification/id/submit - Submit ID document
   */
  @Post('id/submit')
  async submitIDDocument(@Request() req: any, @Body() body: any) {
    return this.verificationService.submitIDDocument(req.user.id, body.sessionId, body.document);
  }

  /**
   * POST /api/verification/address/start - Start address verification
   */
  @Post('address/start')
  async startAddressVerification(@Request() req: any, @Body() body: { address: string }) {
    return this.verificationService.startAddressVerification(req.user.id, body.address);
  }

  /**
   * POST /api/verification/address/verify - Verify address code
   */
  @Post('address/verify')
  async verifyAddressCode(@Request() req: any, @Body() body: { code: string }) {
    return this.verificationService.verifyAddressCode(req.user.id, body.code);
  }

  /**
   * POST /api/verification/background-check/start - Start background check
   */
  @Post('background-check/start')
  async startBackgroundCheck(@Request() req: any) {
    return this.verificationService.startBackgroundCheck(req.user.id);
  }
}
