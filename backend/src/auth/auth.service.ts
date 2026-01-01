import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  /**
   * Send OTP code to email or phone
   */
  async sendOTP(email?: string, phone?: string): Promise<{ message: string }> {
    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    // Generate 6-digit OTP
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user;
    let identifier: string;

    if (email) {
      identifier = email;
      user = await this.prisma.user.findUnique({ where: { email } });
      
      if (!user) {
        // Create new user (will complete profile later)
        user = await this.prisma.user.create({
          data: {
            email,
            name: email.split('@')[0], // Temporary name
          },
        });
      }
    } else if (phone) {
      identifier = phone;
      user = await this.prisma.user.findUnique({ where: { phone } });
      
      if (!user) {
        // Create new user (will complete profile later)
        // Prisma requires an email; create a placeholder unique email derived from phone
        const placeholderEmail = `${phone.replace(/\D/g, '')}@no-email.pepo`;
        user = await this.prisma.user.create({
          data: {
            email: placeholderEmail,
            phone,
            name: `User_${phone.slice(-4)}`, // Temporary name
          },
        });
      }
    }

    if (!user) {
      throw new BadRequestException('Unable to create or find user');
    }

    // Store OTP
    await this.prisma.oTPCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // TODO: Send OTP via email or SMS
    // For now, log it (in production, use SendGrid/Mailgun for email, Twilio for SMS)
    if (email) {
      console.log(`🔐 OTP for ${email}: ${code}`);
    } else if (phone) {
      console.log(`🔐 OTP for ${phone}: ${code}`);
    }

    return { 
      message: email ? 'OTP sent to your email' : 'OTP sent to your phone number' 
    };
  }

  /**
   * Verify OTP and return JWT token (supports email or phone)
   */
  async verifyOTP(email?: string, phone?: string, code?: string) {
    if (!code) {
      throw new BadRequestException('OTP code is required');
    }

    if (!email && !phone) {
      throw new BadRequestException('Email or phone number is required');
    }

    let user;
    if (email) {
      user = await this.prisma.user.findUnique({ where: { email } });
    } else if (phone) {
      user = await this.prisma.user.findUnique({ where: { phone } });
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Find valid OTP
    const otpRecord = await this.prisma.oTPCode.findFirst({
      where: {
        userId: user.id,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used
    await this.prisma.oTPCode.update({
      where: { id: otpRecord.id },
      data: { used: true },
    });

    // Update last login and verification status
    const updateData: any = { lastLoginAt: new Date() };
    if (email) {
      updateData.emailVerified = true;
    } else if (phone) {
      updateData.phoneVerified = true;
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Generate JWT
    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  /**
   * Register with email and password
   */
  async register(
    email: string, 
    password: string, 
    name: string, 
    city?: string, 
    gender?: string,
    phone?: string
  ) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Check if phone number is already taken
    if (phone) {
      const existingPhoneUser = await this.prisma.user.findUnique({ where: { phone } });
      if (existingPhoneUser) {
        throw new BadRequestException('User with this phone number already exists');
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        city,
        phone,
        gender: gender as any,
      },
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  /**
   * Login with email/phone and password
   */
  async login(emailOrPhone: string, password: string) {
    // Try to find user by email first, then by phone
    let user = await this.prisma.user.findUnique({ where: { email: emailOrPhone } });
    
    if (!user) {
      user = await this.prisma.user.findUnique({ where: { phone: emailOrPhone } });
    }

    if (!user || (!user.passwordHash && !(user as any).password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const hash = user.passwordHash || (user as any).password;
    const isPasswordValid = await bcrypt.compare(password, hash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if ((this.prisma.user as any).update) {
      await (this.prisma.user as any).update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      access_token: token,
    };
  }

  /**
   * Google OAuth
   */
  async googleLogin(googleUser: any) {
    let user = await this.prisma.user.findUnique({
      where: { googleId: googleUser.id },
    });

    if (!user) {
      // Check if email exists
      user = await this.prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (user) {
        // Link Google account
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            avatar: googleUser.picture,
            googleId: googleUser.id,
            emailVerified: true,
          },
        });
      }
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: any): string {
    return this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  /**
   * Remove sensitive data from user object
   */
  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Validate user from JWT payload
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        city: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}

