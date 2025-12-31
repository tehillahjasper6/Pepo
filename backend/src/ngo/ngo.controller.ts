import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { NGOService } from './ngo.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('ngo')
@Controller('ngo')
export class NGOController {
  constructor(private ngoService: NGOService) {}

  /**
   * Register as NGO (public endpoint - no auth required)
   */
  @Post('register')
  @ApiOperation({ summary: 'Register as NGO - Complete application' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 5))
  async register(@Body() body: any, @UploadedFiles() files?: Express.Multer.File[]) {
    // Handle file uploads
    const documentUrls: any = {};
    if (files && files.length > 0) {
      // Upload files to Cloudinary
      // This would be handled by the service
      // For now, we'll pass file data to service
    }

    return this.ngoService.registerNGO({
      ...body,
      registrationCertificate: body.registrationCertificate,
      taxExemptionDoc: body.taxExemptionDoc,
      contactNationalIdDoc: body.contactNationalIdDoc,
    });
  }

  /**
   * Apply for NGO status (existing user)
   */
  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for NGO status (existing user)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('documents', 5))
  async apply(@Request() req, @Body() body: any, @UploadedFiles() files?: Express.Multer.File[]) {
    return this.ngoService.applyForNGOStatus(req.user.id, body);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my NGO profile' })
  async getProfile(@Request() req) {
    return this.ngoService.getNGOProfile(req.user.id);
  }

  @Get('verified')
  @ApiOperation({ summary: 'Get all verified NGOs' })
  async getVerifiedNGOs() {
    return this.ngoService.getVerifiedNGOs();
  }

  @Post('campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create campaign (NGO only)' })
  async createCampaign(@Request() req, @Body() body: any) {
    return this.ngoService.createCampaign(req.user.id, body);
  }

  @Get('campaigns')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my campaigns' })
  async getCampaigns(@Request() req) {
    return this.ngoService.getCampaigns(req.user.id);
  }

  @Post('campaigns/:campaignId/giveaways/bulk')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create bulk giveaways in a campaign' })
  async createBulkGiveaways(
    @Request() req,
    @Param('campaignId') campaignId: string,
    @Body() body: { giveaways: any[] },
  ) {
    return this.ngoService.createBulkGiveaways(req.user.id, campaignId, body.giveaways);
  }

  @Post('pickup-points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create pickup point' })
  async createPickupPoint(@Request() req, @Body() body: any) {
    return this.ngoService.createPickupPoint(req.user.id, body);
  }

  @Get('pickup-points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get pickup points' })
  async getPickupPoints(@Request() req) {
    return this.ngoService.getPickupPoints(req.user.id);
  }

  @Post('pickup/verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify pickup code' })
  async verifyPickupCode(@Request() req, @Body() body: { code: string }) {
    return this.ngoService.verifyPickupCode(body.code, req.user.id);
  }

  @Get('pickup/:code/qr')
  @ApiOperation({ summary: 'Generate QR code for pickup' })
  async generateQRCode(@Param('code') code: string) {
    const qrUrl = await this.ngoService.generateQRCode(code);
    return { qrCodeUrl: qrUrl, pickupCode: code };
  }

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get impact dashboard' })
  async getDashboard(@Request() req) {
    return this.ngoService.getImpactDashboard(req.user.id);
  }
}
