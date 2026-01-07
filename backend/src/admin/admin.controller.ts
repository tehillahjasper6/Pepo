import { Controller, Get, Put, Post, Body, Param, Query, UseGuards, Request, Delete, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '@pepo/types';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getStats(@Request() req) {
    return this.adminService.getPlatformStats(req.user.role);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Request() req, @Query() filters: any) {
    return this.adminService.getUsers(req.user.role, filters);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  async getUserById(@Request() req, @Param('id') userId: string) {
    return this.adminService.getUserById(req.user.role, userId);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user role or status' })
  async updateUser(
    @Request() req,
    @Param('id') userId: string,
    @Body() updateData: { role?: UserRole; isActive?: boolean },
  ) {
    return this.adminService.updateUser(req.user.role as UserRole, req.user.id, userId, updateData);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Request() req, @Param('id') userId: string) {
    return this.adminService.deleteUser(req.user.role, req.user.id, userId);
  }

  @Put('users/:userId/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateUserStatus(
    @Request() req,
    @Param('userId') userId: string,
    @Body() body: { isActive: boolean }
  ) {
    return this.adminService.updateUserStatus(req.user.role, userId, body.isActive);
  }

  @Get('ngo/pending')
  @ApiOperation({ summary: 'Get pending NGO applications' })
  async getPendingNGOs(@Request() req) {
    return this.adminService.getPendingNGOs(req.user.role);
  }

  @Get('ngo/:ngoProfileId')
  @ApiOperation({ summary: 'Get NGO application details for review' })
  async getNGOApplication(@Request() req, @Param('ngoProfileId') ngoProfileId: string) {
    return this.adminService.getNGOApplication(req.user.role, ngoProfileId);
  }

  @Post('ngo/:ngoProfileId/verify')
  @ApiOperation({ summary: 'Verify NGO' })
  async verifyNGO(
    @Request() req,
    @Param('ngoProfileId') ngoProfileId: string,
    @Body() body?: { notes?: string }
  ) {
    return this.adminService.verifyNGO(req.user.role, req.user.id, ngoProfileId, body?.notes);
  }

  @Post('ngo/:ngoProfileId/reject')
  @ApiOperation({ summary: 'Reject NGO' })
  async rejectNGO(
    @Request() req,
    @Param('ngoProfileId') ngoProfileId: string,
    @Body() body: { reason: string }
  ) {
    return this.adminService.rejectNGO(req.user.role, req.user.id, ngoProfileId, body.reason);
  }

  @Post('ngo/:ngoProfileId/request-info')
  @ApiOperation({ summary: 'Request additional information from NGO' })
  async requestNGOInfo(
    @Request() req,
    @Param('ngoProfileId') ngoProfileId: string,
    @Body() body: { requestedInfo: string }
  ) {
    return this.adminService.requestNGOInfo(req.user.role, req.user.id, ngoProfileId, body.requestedInfo);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports' })
  async getReports(@Request() req, @Query('status') status?: string) {
    return this.adminService.getReports(req.user.role, status);
  }

  @Post('reports/:reportId/resolve')
  @ApiOperation({ summary: 'Resolve report' })
  async resolveReport(
    @Request() req,
    @Param('reportId') reportId: string,
    @Body() body: { resolution: string }
  ) {
    return this.adminService.resolveReport(req.user.role, req.user.id, reportId, body.resolution);
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@Request() req, @Query() filters: any) {
    return this.adminService.getAuditLogs(req.user.role, filters);
  }

  @Get('transparency-reports/pending')
  @ApiOperation({ summary: 'Get pending transparency reports' })
  async getPendingTransparencyReports(@Request() req) {
    return this.adminService.getPendingTransparencyReports();
  }

  @Post('transparency-reports/:reportId/review')
  @ApiOperation({ summary: 'Review transparency report' })
  async reviewTransparencyReport(
    @Request() req,
    @Param('reportId') reportId: string,
    @Body() body: { action: 'APPROVE' | 'REJECT'; reviewNotes?: string; rejectionReason?: string }
  ) {
    return this.adminService.reviewTransparencyReport(
      reportId,
      req.user.id,
      body.action,
      body.reviewNotes,
      body.rejectionReason
    );
  }
}

