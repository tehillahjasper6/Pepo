import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NGOTransparencyService } from '../ngo/ngo-transparency.service';

@Injectable()
export class AdminService {
  private transparencyService: NGOTransparencyService;

  constructor(private prisma: PrismaService) {
    this.transparencyService = new NGOTransparencyService(prisma);
  }

  private verifyAdmin(userRole: string) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(userRole: string) {
    this.verifyAdmin(userRole);

    const [totalUsers, totalGiveaways, totalNGOs, totalWinners] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.giveaway.count(),
      this.prisma.nGOProfile.count({ where: { status: 'VERIFIED' } }),
      this.prisma.winner.count(),
    ]);

    const recentUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const activeGiveaways = await this.prisma.giveaway.count({
      where: { status: 'OPEN' },
    });

    return {
      totalUsers,
      totalGiveaways,
      totalNGOs,
      totalWinners,
      recentUsers,
      activeGiveaways,
    };
  }

  /**
   * Get all users with filters
   */
  async getUsers(userRole: string, filters?: any) {
    this.verifyAdmin(userRole);

    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        role: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Update user status
   */
  async updateUserStatus(userRole: string, userId: string, isActive: boolean) {
    this.verifyAdmin(userRole);

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  /**
   * Get pending NGO applications
   */
  async getPendingNGOs(userRole: string) {
    this.verifyAdmin(userRole);

    return this.prisma.nGOProfile.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        documents: true,
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get NGO application details for review
   */
  async getNGOApplication(userRole: string, ngoProfileId: string) {
    this.verifyAdmin(userRole);

    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { id: ngoProfileId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        documents: true,
        reviews: {
          include: {
            reviewer: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { reviewedAt: 'desc' },
        },
      },
    });

    if (!ngoProfile) {
      throw new NotFoundException('NGO application not found');
    }

    // Calculate risk flags
    const riskFlags = this.calculateRiskFlags(ngoProfile);

    return {
      ...ngoProfile,
      riskFlags,
    };
  }

  /**
   * Calculate risk flags for NGO application
   */
  private calculateRiskFlags(ngoProfile: any): string[] {
    const flags: string[] = [];

    // Check for missing required documents
    const documentTypes = ngoProfile.documents.map((d: any) => d.documentType);
    if (!documentTypes.includes('REGISTRATION_CERTIFICATE')) {
      flags.push('MISSING_REGISTRATION_CERTIFICATE');
    }

    // Check for mismatched country (if we have location data)
    // This would require additional logic based on registration number format

    // Check for duplicate registration number (already handled in service)

    // Check for recent registration
    const yearsSinceEstablished =
      ngoProfile.yearEstablished
        ? new Date().getFullYear() - ngoProfile.yearEstablished
        : null;
    if (yearsSinceEstablished !== null && yearsSinceEstablished < 1) {
      flags.push('RECENTLY_ESTABLISHED');
    }

    // Check for missing contact information
    if (!ngoProfile.contactPhone || !ngoProfile.contactEmail) {
      flags.push('INCOMPLETE_CONTACT_INFO');
    }

    return flags;
  }

  /**
   * Verify NGO
   */
  async verifyNGO(
    userRole: string,
    adminUserId: string,
    ngoProfileId: string,
    notes?: string,
  ) {
    this.verifyAdmin(userRole);

    // Set expiry date (1 year from now)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const ngoProfile = await this.prisma.nGOProfile.update({
      where: { id: ngoProfileId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        expiresAt,
      },
      include: { user: true },
    });

    // Update user role
    await this.prisma.user.update({
      where: { id: ngoProfile.userId },
      data: { role: 'NGO' },
    });

    // Create review record
    await this.prisma.nGOReview.create({
      data: {
        ngoProfileId,
        reviewerId: adminUserId,
        status: 'APPROVED',
        notes,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'NGO_VERIFIED',
        entity: 'NGOProfile',
        entityId: ngoProfileId,
        metadata: {
          organizationName: ngoProfile.organizationName,
          registrationNumber: ngoProfile.registrationNumber,
        },
      },
    });

    // Send notification
    await this.prisma.notification.create({
      data: {
        userId: ngoProfile.userId,
        type: 'NGO_VERIFIED',
        title: '🎉 NGO Verified!',
        message:
          'Your organization has been verified. You can now create campaigns and start giving.',
        data: { ngoProfileId },
      },
    });

    // Award VERIFIED_NGO badge (idempotent)
    try {
      const def = await this.prisma.badgeDefinition.findUnique({ where: { code: 'VERIFIED_NGO' } });
      if (def) {
        await this.prisma.badgeAssignment.create({
          data: {
            badgeId: def.id,
            ngoProfileId,
            awardedById: adminUserId,
            reason: 'NGO verified by admin',
          },
        });
        await this.prisma.auditLog.create({
          data: {
            userId: adminUserId,
            action: 'BADGE_AWARDED',
            entity: 'BadgeAssignment',
            entityId: def.id,
            metadata: { ngoProfileId, badgeCode: 'VERIFIED_NGO' },
          },
        });
      }
    } catch (e) {
      // Ignore duplicate or other errors
    }

    return ngoProfile;
  }

  /**
   * Reject NGO
   */
  async rejectNGO(
    userRole: string,
    adminUserId: string,
    ngoProfileId: string,
    reason: string,
  ) {
    this.verifyAdmin(userRole);

    const ngoProfile = await this.prisma.nGOProfile.update({
      where: { id: ngoProfileId },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: { user: true },
    });

    // Create review record
    await this.prisma.nGOReview.create({
      data: {
        ngoProfileId,
        reviewerId: adminUserId,
        status: 'REJECTED',
        notes: reason,
      },
    });

    // Create audit log
    await this.prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'NGO_REJECTED',
        entity: 'NGOProfile',
        entityId: ngoProfileId,
        metadata: {
          organizationName: ngoProfile.organizationName,
          reason,
        },
      },
    });

    // Send notification
    await this.prisma.notification.create({
      data: {
        userId: ngoProfile.userId,
        type: 'SYSTEM_ALERT',
        title: 'NGO Application Update',
        message: `Your application has been reviewed. Reason: ${reason}. You can re-apply with updated information.`,
        data: { ngoProfileId, reason },
      },
    });

    return ngoProfile;
  }

  /**
   * Request additional information from NGO
   */
  async requestNGOInfo(
    userRole: string,
    adminUserId: string,
    ngoProfileId: string,
    requestedInfo: string,
  ) {
    this.verifyAdmin(userRole);

    // Create review record with REQUEST_INFO status
    const review = await this.prisma.nGOReview.create({
      data: {
        ngoProfileId,
        reviewerId: adminUserId,
        status: 'REQUEST_INFO',
        requestedInfo,
      },
    });

    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { id: ngoProfileId },
      include: { user: true },
    });

    // Send notification
    await this.prisma.notification.create({
      data: {
        userId: ngoProfile!.userId,
        type: 'SYSTEM_ALERT',
        title: 'Additional Information Required',
        message: `We need additional information to complete your verification: ${requestedInfo}`,
        data: { ngoProfileId, requestedInfo },
      },
    });

    return review;
  }

  /**
   * Get reports
   */
  async getReports(userRole: string, status?: string) {
    this.verifyAdmin(userRole);

    const where: any = {};
    if (status) {
      where.status = status;
    }

    return this.prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, email: true },
        },
        reported: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Resolve report
   */
  async resolveReport(userRole: string, adminUserId: string, reportId: string, resolution: string) {
    this.verifyAdmin(userRole);

    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: adminUserId,
        resolution,
      },
    });
  }

  /**
   * Get audit logs
   */
  async getAuditLogs(userRole: string, filters?: any) {
    this.verifyAdmin(userRole);

    const where: any = {};

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    return this.prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  /**
   * Get pending transparency reports
   */
  async getPendingTransparencyReports() {
    return this.transparencyService.getPendingReports();
  }

  /**
   * Review transparency report
   */
  async reviewTransparencyReport(
    reportId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT',
    reviewNotes?: string,
    rejectionReason?: string
  ) {
    return this.transparencyService.reviewReport(
      reportId,
      adminId,
      action,
      reviewNotes,
      rejectionReason
    );
  }
}

