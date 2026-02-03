import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransparencyReportStatus, NGOStatus } from '@prisma/client';

/**
 * NGO Transparency Report Service
 * 
 * Handles submission, review, and publication of NGO transparency reports.
 * Reports are reviewed by admins before becoming publicly visible.
 */

@Injectable()
export class NGOTransparencyService {
  constructor(private prisma: PrismaService) {}

  /**
   * Submit a transparency report (NGO only)
   */
  async submitReport(
    ngoProfileId: string,
    userId: string,
    data: {
      reportFrequency: 'QUARTERLY' | 'ANNUAL';
      periodStart: Date;
      periodEnd: Date;
      campaignCount: number;
      itemsDistributed: number;
      locationsServed: string[];
      fundsReceivedMin?: number;
      fundsReceivedMax?: number;
      fundsUtilized?: any; // JSON object with categories
      beneficiariesReached: number;
      successStories?: Array<{
        title: string;
        description: string;
        images?: string[];
      }>;
      challenges?: string;
      lessonsLearned?: string;
      supportingDocuments?: string[];
    }
  ) {
    // Verify NGO ownership
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: {
        id: ngoProfileId,
        userId,
        status: NGOStatus.VERIFIED, // Only verified NGOs can submit reports
      },
    });

    if (!ngoProfile) {
      throw new ForbiddenException('Only verified NGOs can submit transparency reports');
    }

    // Validate period
    if (data.periodStart >= data.periodEnd) {
      throw new BadRequestException('Period start must be before period end');
    }

    // Check for overlapping periods
    const existingReport = await this.prisma.nGOTransparencyReport.findFirst({
      where: {
        ngoProfileId,
        periodStart: { lte: data.periodEnd },
        periodEnd: { gte: data.periodStart },
        status: {
          in: [TransparencyReportStatus.DRAFT, TransparencyReportStatus.SUBMITTED, TransparencyReportStatus.APPROVED],
        },
      },
    });

    if (existingReport) {
      throw new BadRequestException('A report already exists for this period');
    }

    // Create report
    const report = await this.prisma.nGOTransparencyReport.create({
      data: {
        ngoProfileId,
        reportFrequency: data.reportFrequency,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        campaignCount: data.campaignCount,
        itemsDistributed: data.itemsDistributed,
        locationsServed: data.locationsServed,
        fundsReceivedMin: data.fundsReceivedMin,
        fundsReceivedMax: data.fundsReceivedMax,
        fundsUtilized: data.fundsUtilized as any,
        beneficiariesReached: data.beneficiariesReached,
        successStories: data.successStories as any,
        challenges: data.challenges,
        lessonsLearned: data.lessonsLearned,
        supportingDocuments: data.supportingDocuments || [],
        status: TransparencyReportStatus.SUBMITTED,
        submittedAt: new Date(),
      },
    });

    // Notify admins
    await this.notifyAdmins(ngoProfileId, report.id);

    return report;
  }

  /**
   * Save report as draft (NGO only)
   */
  async saveDraft(
    ngoProfileId: string,
    userId: string,
    reportId: string,
    data: Partial<{
      reportFrequency: 'QUARTERLY' | 'ANNUAL';
      periodStart: Date;
      periodEnd: Date;
      campaignCount: number;
      itemsDistributed: number;
      locationsServed: string[];
      fundsReceivedMin: number;
      fundsReceivedMax: number;
      fundsUtilized: any;
      beneficiariesReached: number;
      successStories: any[];
      challenges: string;
      lessonsLearned: string;
      supportingDocuments: string[];
    }>
  ) {
    // Verify ownership
    const report = await this.prisma.nGOTransparencyReport.findFirst({
      where: {
        id: reportId,
        ngoProfile: {
          id: ngoProfileId,
          userId,
          status: NGOStatus.VERIFIED,
        },
        status: TransparencyReportStatus.DRAFT,
      },
    });

    if (!report) {
      throw new ForbiddenException('Report not found or cannot be edited');
    }

    return this.prisma.nGOTransparencyReport.update({
      where: { id: reportId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get NGO's transparency reports
   */
  async getNGOReports(ngoProfileId: string, userId: string) {
    // Verify ownership
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: {
        id: ngoProfileId,
        userId,
      },
    });

    if (!ngoProfile) {
      throw new ForbiddenException('NGO profile not found');
    }

    return this.prisma.nGOTransparencyReport.findMany({
      where: { ngoProfileId },
      orderBy: { periodEnd: 'desc' },
    });
  }

  /**
   * Admin: Review and approve/reject report
   */
  async reviewReport(
    reportId: string,
    adminId: string,
    action: 'APPROVE' | 'REJECT',
    reviewNotes?: string,
    rejectionReason?: string
  ) {
    const report = await this.prisma.nGOTransparencyReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new BadRequestException('Report not found');
    }

    if (report.status !== TransparencyReportStatus.SUBMITTED) {
      throw new BadRequestException('Report is not in submitted status');
    }

    const updateData: any = {
      reviewedAt: new Date(),
      reviewedBy: adminId,
      reviewNotes,
    };

    if (action === 'APPROVE') {
      updateData.status = TransparencyReportStatus.APPROVED;
    } else {
      updateData.status = TransparencyReportStatus.REJECTED;
      updateData.rejectionReason = rejectionReason || 'Report rejected by admin';
    }

    const updatedReport = await this.prisma.nGOTransparencyReport.update({
      where: { id: reportId },
      data: updateData,
    });

    // Recalculate confidence score after approval
    if (action === 'APPROVE') {
      // Trigger score recalculation (async)
      this.recalculateConfidenceScore(report.ngoProfileId).catch(console.error);
    }

    return updatedReport;
  }

  /**
   * Get pending reports for admin review
   */
  async getPendingReports() {
    return this.prisma.nGOTransparencyReport.findMany({
      where: {
        status: TransparencyReportStatus.SUBMITTED,
      },
      include: {
        ngoProfile: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: 'asc',
      },
    });
  }

  /**
   * Notify admins of new report submission
   */
  private async notifyAdmins(ngoProfileId: string, reportId: string) {
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    // Create notifications for admins
    await Promise.all(
      admins.map((admin) =>
        this.prisma.notification.create({
          data: {
            userId: admin.id,
            type: 'SYSTEM_ALERT',
            title: 'New Transparency Report Submitted',
            message: 'A new transparency report requires review',
            data: {
              ngoProfileId,
              reportId,
              type: 'TRANSPARENCY_REPORT',
            },
          },
        })
      )
    );
  }

  /**
   * Recalculate confidence score (called after report approval)
   */
  private async recalculateConfidenceScore(ngoProfileId: string) {
    // This would call the trust service to recalculate
    // For now, we'll just mark it for recalculation
    // The score will be recalculated on next profile view
  }
}




