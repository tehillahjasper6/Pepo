import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface VerificationStep {
  type: 'email' | 'phone' | 'government_id' | 'address' | 'background_check';
  status: 'pending' | 'verified' | 'rejected';
  verifiedAt?: Date;
  metadata?: any;
}

@Injectable()
export class VerificationService {
  constructor(private prisma: PrismaService) {}

  /**
   * Start email verification process
   */
  async startEmailVerification(userId: string, email: string) {
    const code = this.generateVerificationCode();
    
    // TODO: Send email with verification code
    
    return {
      status: 'sent',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      message: 'Verification code sent to email',
    };
  }

  /**
   * Verify email with code
   */
  async verifyEmail(userId: string, code: string) {
    // TODO: Validate code and update user
    return {
      status: 'verified',
      verifiedAt: new Date(),
    };
  }

  /**
   * Start phone verification
   */
  async startPhoneVerification(userId: string, phone: string) {
    const code = this.generateVerificationCode();
    
    // TODO: Send SMS with verification code
    
    return {
      status: 'sent',
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      message: 'Verification code sent via SMS',
    };
  }

  /**
   * Verify phone with OTP
   */
  async verifyPhone(userId: string, code: string) {
    // TODO: Validate code and update user
    return {
      status: 'verified',
      verifiedAt: new Date(),
    };
  }

  /**
   * Start ID verification (document upload)
   */
  async startIDVerification(userId: string, documentType: string) {
    // Generate a verification session
    const sessionId = this.generateSessionId();
    
    return {
      sessionId,
      status: 'pending',
      message: 'Upload government-issued ID to continue',
      acceptedFormats: ['pdf', 'jpg', 'png'],
      maxFileSize: '5MB',
    };
  }

  /**
   * Submit ID document for verification
   */
  async submitIDDocument(userId: string, sessionId: string, document: any) {
    // TODO: Store document, run OCR, validate
    // TODO: Queue for manual review
    
    return {
      status: 'under_review',
      estimatedTime: '24-48 hours',
      message: 'Your document is being reviewed',
    };
  }

  /**
   * Verify address with postal verification
   */
  async startAddressVerification(userId: string, address: string) {
    // TODO: Send verification letter to address
    
    return {
      status: 'letter_sent',
      estimatedTime: '7-14 days',
      message: 'Verification letter sent to your address',
    };
  }

  /**
   * Confirm address with code from letter
   */
  async verifyAddressCode(userId: string, code: string) {
    // TODO: Validate code
    return {
      status: 'verified',
      verifiedAt: new Date(),
    };
  }

  /**
   * Get user verification status
   */
  async getUserVerificationStatus(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        emailVerified: true,
        phoneVerified: true,
        idVerified: true,
      },
    });

    if (!user) return null;

    const verificationSteps: VerificationStep[] = [
      {
        type: 'email',
        status: user.emailVerified ? 'verified' : 'pending',
      },
      {
        type: 'phone',
        status: user.phoneVerified ? 'verified' : 'pending',
      },
      {
        type: 'government_id',
        status: user.idVerified ? 'verified' : 'pending',
      },
      {
        type: 'address',
        status: 'pending', // TODO: Check addressVerified
      },
    ];

    const allVerified = verificationSteps.every(s => s.status === 'verified');
    const completionPercentage = (verificationSteps.filter(s => s.status === 'verified').length / verificationSteps.length) * 100;

    return {
      userId,
      verificationSteps,
      isFullyVerified: allVerified,
      completionPercentage,
      verificationLevel: this.getVerificationLevel(verificationSteps),
      benefits: this.getVerificationBenefits(verificationSteps),
    };
  }

  /**
   * Get verification badge info
   */
  async getVerificationBadge(userId: string) {
    const status = await this.getUserVerificationStatus(userId);
    
    if (!status) return null;

    const badges = [];

    // Email verified badge
    if (status.verificationSteps.find(s => s.type === 'email')?.status === 'verified') {
      badges.push({
        type: 'email_verified',
        label: 'Email Verified',
        icon: '✉️',
        color: 'blue',
      });
    }

    // Phone verified badge
    if (status.verificationSteps.find(s => s.type === 'phone')?.status === 'verified') {
      badges.push({
        type: 'phone_verified',
        label: 'Phone Verified',
        icon: '📱',
        color: 'green',
      });
    }

    // ID verified badge
    if (status.verificationSteps.find(s => s.type === 'government_id')?.status === 'verified') {
      badges.push({
        type: 'id_verified',
        label: 'ID Verified',
        icon: '🆔',
        color: 'purple',
      });
    }

    // Fully verified badge
    if (status.isFullyVerified) {
      badges.push({
        type: 'fully_verified',
        label: 'Fully Verified',
        icon: '✓',
        color: 'gold',
        priority: 'high',
      });
    }

    return {
      userId,
      badges,
      verificationLevel: status.verificationLevel,
      trustBoost: this.calculateTrustBoost(badges),
    };
  }

  /**
   * Initiate background check (if needed)
   */
  async startBackgroundCheck(userId: string) {
    // TODO: Integrate with third-party background check service
    
    return {
      status: 'pending',
      estimatedTime: '2-5 business days',
      message: 'Background check initiated',
    };
  }

  // Helper methods

  private generateVerificationCode(): string {
    return Math.random().toString().substring(2, 8);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private getVerificationLevel(steps: VerificationStep[]): string {
    const verified = steps.filter(s => s.status === 'verified').length;
    
    if (verified === steps.length) return 'FULLY_VERIFIED';
    if (verified >= 3) return 'HIGHLY_VERIFIED';
    if (verified >= 2) return 'PARTIALLY_VERIFIED';
    return 'UNVERIFIED';
  }

  private getVerificationBenefits(steps: VerificationStep[]): string[] {
    const benefits = [];
    const verified = steps.filter(s => s.status === 'verified').length;

    if (verified >= 2) {
      benefits.push('Higher trust score', 'Better visibility in search');
    }
    if (verified >= 3) {
      benefits.push('Access to NGO programs', 'Priority in matching');
    }
    if (verified === steps.length) {
      benefits.push('Verified badge', 'Increased giveaway limit', 'Community moderator eligibility');
    }

    return benefits;
  }

  private calculateTrustBoost(badges: any[]): number {
    let boost = 0;
    
    for (const badge of badges) {
      if (badge.type === 'email_verified') boost += 5;
      if (badge.type === 'phone_verified') boost += 10;
      if (badge.type === 'id_verified') boost += 20;
      if (badge.type === 'fully_verified') boost += 15;
    }
    
    return Math.min(boost, 50); // Max 50 point boost
  }
}
