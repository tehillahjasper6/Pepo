import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { randomBytes } from 'crypto';

@Injectable()
export class NGOService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

  /**
   * Register as NGO - Complete application with documents
   */
  async registerNGO(data: {
    // User account
    email: string;
    password: string;
    name: string;

    // Organization details
    organizationName: string;
    organizationType: string;
    country: string;
    city: string;
    address: string;
    yearEstablished?: number;
    registrationNumber: string;
    taxExemptionId?: string;
    website?: string;
    officialEmail: string;
    officialPhone: string;

    // Primary contact
    contactName: string;
    contactRole: string;
    contactEmail: string;
    contactPhone: string;
    contactNationalId?: string;

    // Documents (file URLs after upload)
    registrationCertificate?: string;
    taxExemptionDoc?: string;
    contactNationalIdDoc?: string;
  }) {
    // Check if registration number already exists
    const existing = await this.prisma.nGOProfile.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existing) {
      throw new BadRequestException(
        'An organization with this registration number already exists',
      );
    }

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Create user account (password will be hashed in auth service)
    // For now, we'll create the user here, but ideally this should be in auth service
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        role: 'NGO', // Will be activated after verification
      },
    });

    // Create NGO profile
    const ngoProfile = await this.prisma.nGOProfile.create({
      data: {
        userId: user.id,
        organizationName: data.organizationName,
        organizationType: data.organizationType as any,
        country: data.country,
        city: data.city,
        address: data.address,
        yearEstablished: data.yearEstablished,
        registrationNumber: data.registrationNumber,
        taxExemptionId: data.taxExemptionId,
        website: data.website,
        officialEmail: data.officialEmail,
        officialPhone: data.officialPhone,
        contactName: data.contactName,
        contactRole: data.contactRole,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactNationalId: data.contactNationalId,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Upload documents if provided
    if (data.registrationCertificate) {
      await this.prisma.nGODocument.create({
        data: {
          ngoProfileId: ngoProfile.id,
          documentType: 'REGISTRATION_CERTIFICATE',
          fileName: 'registration_certificate.pdf',
          fileUrl: data.registrationCertificate,
        },
      });
    }

    if (data.taxExemptionDoc) {
      await this.prisma.nGODocument.create({
        data: {
          ngoProfileId: ngoProfile.id,
          documentType: 'TAX_EXEMPTION',
          fileName: 'tax_exemption.pdf',
          fileUrl: data.taxExemptionDoc,
        },
      });
    }

    if (data.contactNationalIdDoc) {
      await this.prisma.nGODocument.create({
        data: {
          ngoProfileId: ngoProfile.id,
          documentType: 'NATIONAL_ID',
          fileName: 'contact_national_id.pdf',
          fileUrl: data.contactNationalIdDoc,
        },
      });
    }

    // Create initial review record
    await this.prisma.nGOReview.create({
      data: {
        ngoProfileId: ngoProfile.id,
        reviewerId: user.id, // System review
        status: 'PENDING',
      },
    });

    // Send notification to admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    const notifications = admins.map((admin) =>
      this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'New NGO Application',
          message: `${data.organizationName} has applied for NGO verification`,
          data: { ngoProfileId: ngoProfile.id },
        },
      }),
    );

    await Promise.all(notifications);

    return {
      message: 'Your application is under review.',
      ngoProfile,
      status: 'PENDING_VERIFICATION',
    };
  }

  /**
   * Apply for NGO status (existing user)
   */
  async applyForNGOStatus(userId: string, data: any) {
    // Check if user already has NGO profile
    const existing = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new ForbiddenException('NGO profile already exists');
    }

    // Check registration number uniqueness
    const existingReg = await this.prisma.nGOProfile.findUnique({
      where: { registrationNumber: data.registrationNumber },
    });

    if (existingReg) {
      throw new BadRequestException(
        'An organization with this registration number already exists',
      );
    }

    const ngoProfile = await this.prisma.nGOProfile.create({
      data: {
        userId,
        organizationName: data.organizationName,
        organizationType: data.organizationType,
        country: data.country,
        city: data.city,
        address: data.address,
        yearEstablished: data.yearEstablished,
        registrationNumber: data.registrationNumber,
        taxExemptionId: data.taxExemptionId,
        website: data.website,
        officialEmail: data.officialEmail,
        officialPhone: data.officialPhone,
        contactName: data.contactName,
        contactRole: data.contactRole,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        contactNationalId: data.contactNationalId,
        status: 'PENDING_VERIFICATION',
      },
    });

    // Upload documents
    if (data.documents) {
      for (const doc of data.documents) {
        await this.prisma.nGODocument.create({
          data: {
            ngoProfileId: ngoProfile.id,
            documentType: doc.type,
            fileName: doc.fileName,
            fileUrl: doc.fileUrl,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
          },
        });
      }
    }

    // Create review record
    await this.prisma.nGOReview.create({
      data: {
        ngoProfileId: ngoProfile.id,
        reviewerId: userId,
        status: 'PENDING',
      },
    });

    // Notify admins
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    const notifications = admins.map((admin) =>
      this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM_ALERT',
          title: 'New NGO Application',
          message: `${data.organizationName} has applied for NGO status`,
          data: { ngoProfileId: ngoProfile.id },
        },
      }),
    );

    await Promise.all(notifications);

    return ngoProfile;
  }

  /**
   * Get NGO profile with documents
   */
  async getNGOProfile(userId: string) {
    const profile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
      include: {
        documents: true,
        campaigns: {
          include: {
            _count: {
              select: { giveaways: true },
            },
          },
        },
        pickupPoints: {
          where: { isActive: true },
        },
        reviews: {
          orderBy: { reviewedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('NGO profile not found');
    }

    return profile;
  }

  /**
   * Get all verified NGOs
   */
  async getVerifiedNGOs() {
    return this.prisma.nGOProfile.findMany({
      where: { status: 'VERIFIED' },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: { campaigns: true },
        },
      },
    });
  }

  /**
   * Create campaign (NGO only)
   */
  async createCampaign(userId: string, data: any) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (!ngoProfile) {
      throw new ForbiddenException('Only NGOs can create campaigns');
    }

    if (ngoProfile.status !== 'VERIFIED') {
      throw new ForbiddenException('NGO must be verified to create campaigns');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        ngoProfileId: ngoProfile.id,
        title: data.title,
        description: data.description,
        slug: this.generateSlug(data.title),
        coverImage: data.coverImage,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        isRecurring: data.isRecurring || false,
        recurringRule: data.recurringRule,
      },
    });

    return campaign;
  }

  /**
   * Create bulk giveaways (NGO only)
   */
  async createBulkGiveaways(
    userId: string,
    campaignId: string,
    giveaways: Array<{
      title: string;
      description: string;
      category: string;
      location: string;
      quantity: number;
      eligibilityGender?: string;
      eligibilityAgeMin?: number;
      eligibilityAgeMax?: number;
      images?: string[];
      expiresAt?: string;
    }>,
  ) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (!ngoProfile || ngoProfile.status !== 'VERIFIED') {
      throw new ForbiddenException('Only verified NGOs can create bulk giveaways');
    }

    // Verify campaign belongs to NGO
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || campaign.ngoProfileId !== ngoProfile.id) {
      throw new ForbiddenException('Campaign not found or access denied');
    }

    // Create all giveaways
    const createdGiveaways = await Promise.all(
      giveaways.map((giveaway) =>
        this.prisma.giveaway.create({
          data: {
            userId,
            campaignId,
            title: giveaway.title,
            description: giveaway.description,
            category: giveaway.category,
            location: giveaway.location,
            quantity: giveaway.quantity || 1,
            eligibilityGender: giveaway.eligibilityGender || 'ALL',
            eligibilityAgeMin: giveaway.eligibilityAgeMin,
            eligibilityAgeMax: giveaway.eligibilityAgeMax,
            images: giveaway.images || [],
            status: 'OPEN',
            publishedAt: new Date(),
            expiresAt: giveaway.expiresAt ? new Date(giveaway.expiresAt) : null,
          },
        }),
      ),
    );

    // Update campaign metrics
    await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        totalGiveaways: {
          increment: createdGiveaways.length,
        },
      },
    });

    // Update NGO metrics
    await this.prisma.nGOProfile.update({
      where: { id: ngoProfile.id },
      data: {
        totalGiveaways: {
          increment: createdGiveaways.length,
        },
      },
    });

    return {
      message: `Successfully created ${createdGiveaways.length} giveaways`,
      giveaways: createdGiveaways,
    };
  }

  /**
   * Create pickup point
   */
  async createPickupPoint(userId: string, data: any) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (!ngoProfile || ngoProfile.status !== 'VERIFIED') {
      throw new ForbiddenException('Only verified NGOs can create pickup points');
    }

    const pickupPoint = await this.prisma.pickupPoint.create({
      data: {
        ngoProfileId: ngoProfile.id,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        latitude: data.latitude,
        longitude: data.longitude,
        contactPhone: data.contactPhone,
        hours: data.hours,
      },
    });

    return pickupPoint;
  }

  /**
   * Get pickup points
   */
  async getPickupPoints(userId: string) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (!ngoProfile) {
      throw new ForbiddenException('NGO profile not found');
    }

    return this.prisma.pickupPoint.findMany({
      where: { ngoProfileId: ngoProfile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Verify pickup code
   */
  async verifyPickupCode(code: string, userId: string) {
    const pickup = await this.prisma.pickup.findUnique({
      where: { pickupCode: code },
      include: {
        winner: {
          include: {
            giveaway: {
              include: {
                user: true,
              },
            },
          },
        },
        pickupPoint: true,
      },
    });

    if (!pickup) {
      throw new NotFoundException('Invalid pickup code');
    }

    // Check if user is authorized (NGO or admin)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const isNGO = user?.role === 'NGO';
    const isAdmin = user?.role === 'ADMIN';
    const isGiver = pickup.winner.giveaway.userId === userId;

    if (!isNGO && !isAdmin && !isGiver) {
      throw new ForbiddenException('Not authorized to verify this pickup');
    }

    // Mark as completed
    const updated = await this.prisma.pickup.update({
      where: { id: pickup.id },
      data: {
        completedAt: new Date(),
        verifiedBy: userId,
      },
      include: {
        winner: {
          include: {
            user: true,
          },
        },
      },
    });

    return updated;
  }

  /**
   * Generate QR code for pickup (returns data URL or URL to QR code service)
   */
  async generateQRCode(pickupCode: string): Promise<string> {
    // In production, use a QR code library like 'qrcode'
    // For now, return a placeholder URL
    // TODO: Implement actual QR code generation
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${pickupCode}`;
  }

  /**
   * Calculate trust score for NGO
   */
  async calculateTrustScore(ngoProfileId: string): Promise<number> {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { id: ngoProfileId },
      include: {
        campaigns: {
          include: {
            giveaways: {
              include: {
                winners: true,
                participants: true,
              },
            },
          },
        },
        reviews: true,
      },
    });

    if (!ngoProfile) {
      return 0;
    }

    let score = 0;

    // Base score for verification (50 points)
    if (ngoProfile.status === 'VERIFIED') {
      score += 50;
    }

    // Activity score (30 points max)
    const totalGiveaways = ngoProfile.totalGiveaways;
    const activityScore = Math.min(30, (totalGiveaways / 10) * 10);
    score += activityScore;

    // Completion rate (20 points max)
    const allGiveaways = ngoProfile.campaigns.flatMap((c) => c.giveaways);
    const completedGiveaways = allGiveaways.filter(
      (g) => g.status === 'COMPLETED',
    ).length;
    const completionRate =
      allGiveaways.length > 0 ? completedGiveaways / allGiveaways.length : 0;
    score += completionRate * 20;

    // Update trust score
    await this.prisma.nGOProfile.update({
      where: { id: ngoProfileId },
      data: { trustScore: score },
    });

    return Math.min(100, score); // Cap at 100
  }

  /**
   * Get NGO campaigns
   */
  async getCampaigns(userId: string) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
    });

    if (!ngoProfile) {
      throw new ForbiddenException('NGO profile not found');
    }

    return this.prisma.campaign.findMany({
      where: { ngoProfileId: ngoProfile.id },
      include: {
        giveaways: {
          include: {
            _count: {
              select: { participants: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get impact dashboard
   */
  async getImpactDashboard(userId: string) {
    const ngoProfile = await this.prisma.nGOProfile.findUnique({
      where: { userId },
      include: {
        campaigns: {
          include: {
            giveaways: {
              include: {
                _count: {
                  select: { participants: true, winners: true },
                },
              },
            },
          },
        },
      },
    });

    if (!ngoProfile) {
      throw new NotFoundException('NGO profile not found');
    }

    // Calculate metrics
    const totalGiveaways = ngoProfile.campaigns.reduce(
      (sum, campaign) => sum + campaign.giveaways.length,
      0,
    );

    const totalBeneficiaries = ngoProfile.campaigns.reduce(
      (sum, campaign) =>
        sum +
        campaign.giveaways.reduce((gSum, g) => gSum + g._count.winners, 0),
      0,
    );

    const totalParticipants = ngoProfile.campaigns.reduce(
      (sum, campaign) =>
        sum +
        campaign.giveaways.reduce((gSum, g) => gSum + g._count.participants, 0),
      0,
    );

    // Calculate trust score
    const trustScore = await this.calculateTrustScore(ngoProfile.id);

    return {
      totalCampaigns: ngoProfile.campaigns.length,
      totalGiveaways,
      totalBeneficiaries,
      totalParticipants,
      trustScore,
      campaigns: ngoProfile.campaigns,
    };
  }

  /**
   * Generate URL-friendly slug
   */
  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') +
      '-' +
      Date.now()
    );
  }
}
