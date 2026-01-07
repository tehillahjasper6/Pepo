import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';
import * as twilio from 'twilio';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private twilioClient: twilio.Twilio;
  private sendGridApiKey: string;
  private emailFrom: string;
  private twilioPhoneNumber: string;

  constructor(private configService: ConfigService) {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize SendGrid
    this.sendGridApiKey = this.configService.get<string>('SENDGRID_API_KEY');
    this.emailFrom = this.configService.get<string>('EMAIL_FROM', 'noreply@pepo.app');
    
    if (this.sendGridApiKey) {
      sgMail.setApiKey(this.sendGridApiKey);
    }

    // Initialize Twilio
    const twilioAccountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.twilioPhoneNumber = this.configService.get<string>('TWILIO_PHONE_NUMBER');

    if (twilioAccountSid && twilioAuthToken) {
      this.twilioClient = twilio(twilioAccountSid, twilioAuthToken);
    }
  }

  /**
   * Send OTP via Email using SendGrid
   */
  async sendOTPEmail(email: string, otp: string, expiresInMinutes: number = 10): Promise<boolean> {
    try {
      if (!this.sendGridApiKey) {
        this.logger.warn('SendGrid API key not configured. OTP email not sent.');
        this.logger.log(`📧 [MOCK] OTP sent to ${email}: ${otp} (expires in ${expiresInMinutes} minutes)`);
        return true;
      }

      const htmlContent = this.generateOTPEmailTemplate(otp, expiresInMinutes);

      const msg = {
        to: email,
        from: this.emailFrom,
        subject: `Your PEPO Verification Code: ${otp}`,
        html: htmlContent,
        text: `Your PEPO verification code is: ${otp}. This code expires in ${expiresInMinutes} minutes. Do not share this code with anyone.`,
      };

      await sgMail.send(msg);
      this.logger.log(`📧 OTP email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send OTP via SMS using Twilio
   */
  async sendOTPSMS(phoneNumber: string, otp: string, expiresInMinutes: number = 10): Promise<boolean> {
    try {
      if (!this.twilioClient || !this.twilioPhoneNumber) {
        this.logger.warn('Twilio not configured. OTP SMS not sent.');
        this.logger.log(`📱 [MOCK] OTP sent to ${phoneNumber}: ${otp} (expires in ${expiresInMinutes} minutes)`);
        return true;
      }

      const message = await this.twilioClient.messages.create({
        body: `Your PEPO verification code is: ${otp}. This code expires in ${expiresInMinutes} minutes. Do not share this code.`,
        from: this.twilioPhoneNumber,
        to: phoneNumber,
      });

      this.logger.log(`📱 OTP SMS sent to ${phoneNumber} (SID: ${message.sid})`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Send verification email to new users
   */
  async sendVerificationEmail(email: string, verificationLink: string): Promise<boolean> {
    try {
      if (!this.sendGridApiKey) {
        this.logger.warn('SendGrid not configured. Verification email not sent.');
        this.logger.log(`📧 [MOCK] Verification email sent to ${email}`);
        return true;
      }

      const htmlContent = this.generateVerificationEmailTemplate(verificationLink);

      const msg = {
        to: email,
        from: this.emailFrom,
        subject: 'Verify Your PEPO Account',
        html: htmlContent,
        text: `Click this link to verify your account: ${verificationLink}`,
      };

      await sgMail.send(msg);
      this.logger.log(`📧 Verification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    try {
      if (!this.sendGridApiKey) {
        this.logger.warn('SendGrid not configured. Welcome email not sent.');
        this.logger.log(`📧 [MOCK] Welcome email sent to ${email}`);
        return true;
      }

      const htmlContent = this.generateWelcomeEmailTemplate(name);

      const msg = {
        to: email,
        from: this.emailFrom,
        subject: `Welcome to PEPO, ${name}!`,
        html: htmlContent,
        text: `Welcome to PEPO! We're excited to have you on board.`,
      };

      await sgMail.send(msg);
      this.logger.log(`📧 Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
    try {
      if (!this.sendGridApiKey) {
        this.logger.warn('SendGrid not configured. Password reset email not sent.');
        this.logger.log(`📧 [MOCK] Password reset email sent to ${email}`);
        return true;
      }

      const htmlContent = this.generatePasswordResetEmailTemplate(resetLink);

      const msg = {
        to: email,
        from: this.emailFrom,
        subject: 'Reset Your PEPO Password',
        html: htmlContent,
        text: `Click this link to reset your password: ${resetLink}`,
      };

      await sgMail.send(msg);
      this.logger.log(`📧 Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    email: string,
    subject: string,
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): Promise<boolean> {
    try {
      if (!this.sendGridApiKey) {
        this.logger.warn('SendGrid not configured. Notification email not sent.');
        this.logger.log(`📧 [MOCK] Notification email sent to ${email}`);
        return true;
      }

      const htmlContent = this.generateNotificationEmailTemplate(
        title,
        message,
        actionUrl,
        actionLabel
      );

      const msg = {
        to: email,
        from: this.emailFrom,
        subject: subject,
        html: htmlContent,
        text: message,
      };

      await sgMail.send(msg);
      this.logger.log(`📧 Notification email sent to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${email}:`, error);
      return false;
    }
  }

  /**
   * HTML template for OTP email
   */
  private generateOTPEmailTemplate(otp: string, expiresInMinutes: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .otp-box { background: white; border: 2px solid #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
          .otp { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PEPO Verification</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Here's your verification code to complete your sign-up process:</p>
            <div class="otp-box">
              <div class="otp">${otp}</div>
            </div>
            <p><strong>This code expires in ${expiresInMinutes} minutes</strong></p>
            <p>If you didn't request this code, you can safely ignore this email.</p>
            <p>Never share this code with anyone. PEPO support will never ask for your verification code.</p>
            <div class="footer">
              <p>&copy; 2026 PEPO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for verification email
   */
  private generateVerificationEmailTemplate(verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .btn { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up for PEPO! Please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationLink}" class="btn">Verify Email</a>
            </div>
            <p>Or copy this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
            <p>This link expires in 24 hours.</p>
            <div class="footer">
              <p>&copy; 2026 PEPO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for welcome email
   */
  private generateWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .btn { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to PEPO!</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Welcome to PEPO! We're thrilled to have you join our community.</p>
            <p>Whether you're looking to share, give, or help others, you're in the right place.</p>
            <div style="text-align: center;">
              <a href="https://pepo.app" class="btn">Explore PEPO</a>
            </div>
            <p>If you have any questions, feel free to reach out to us.</p>
            <div class="footer">
              <p>&copy; 2026 PEPO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for password reset email
   */
  private generatePasswordResetEmailTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .btn { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0; }
          .warning { background: #fff3cd; padding: 12px; border-radius: 4px; margin: 20px 0; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center;">
              <a href="${resetLink}" class="btn">Reset Password</a>
            </div>
            <p>Or copy this link in your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
            <div class="warning">
              <strong>⚠️ Security Note:</strong> This link expires in 1 hour. If you didn't request this reset, please ignore this email or change your password immediately.
            </div>
            <div class="footer">
              <p>&copy; 2026 PEPO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * HTML template for generic notification email
   */
  private generateNotificationEmailTemplate(
    title: string,
    message: string,
    actionUrl?: string,
    actionLabel?: string
  ): string {
    let actionButton = '';
    if (actionUrl && actionLabel) {
      actionButton = `
        <div style="text-align: center;">
          <a href="${actionUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">
            ${actionLabel}
          </a>
        </div>
      `;
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { font-size: 12px; color: #999; text-align: center; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>${message}</p>
            ${actionButton}
            <div class="footer">
              <p>&copy; 2026 PEPO. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
