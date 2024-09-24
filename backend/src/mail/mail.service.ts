import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { getEmailVerificationTemplate } from './emailTemplate/verification.email.template';
import { getPasswordResetLinkTemplate } from './emailTemplate/password.reset.template';
import { errorMessages } from 'src/utils/messages/messages';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `http://localhost:3000/auth/ap1/v1/verify-email?token=${token}`;
    const emailBody = getEmailVerificationTemplate(verificationLink);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Email Verification',
        html: emailBody,
      });
    } catch (error) {
      console.log(`[Mail.Service] Error during verification mail: ${error}`);
      throw new InternalServerErrorException(
        errorMessages.ERROR_SENDING_VERIFICATION_EMAIL,
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const emailBody = getPasswordResetLinkTemplate(resetLink);
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset Request',
        html: emailBody,
      });
    } catch (error) {
      console.log(
        `[Mail.Service] Error during sending password reset email: ${error}`,
      );
      throw new InternalServerErrorException(
        errorMessages.ERROR_SENDING_PASSWORD_RESET_EMAIL,
      );
    }
  }
}
