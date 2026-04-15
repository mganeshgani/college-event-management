import { logger } from './logger';
import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Log email instead of sending (SendGrid removed for final year project)
 */
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  logger.info(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
  logger.info(`[EMAIL] Content: ${options.text || options.html.replace(/<[^>]*>/g, '').substring(0, 100)}...`);
  return true;
};

/**
 * Send enrollment confirmation email
 */
export const sendEnrollmentConfirmation = async (
  email: string,
  userName: string,
  activityTitle: string,
  activityDate: Date,
  activityLocation: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .details { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Enrollment Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>You have successfully enrolled in:</p>
            <div class="details">
              <h2 style="margin-top: 0; color: #667eea;">${activityTitle}</h2>
              <p><strong>📅 Date:</strong> ${new Date(activityDate).toLocaleDateString('en-IN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}</p>
              <p><strong>📍 Location:</strong> ${activityLocation}</p>
            </div>
            <p>We look forward to seeing you there! Please arrive 15 minutes before the scheduled time.</p>
            <a href="${config.frontend.url}/my-activities" class="button">View My Activities</a>
          </div>
          <div class="footer">
            <p>© 2026 Event Management System. All rights reserved.</p>
            <p>If you didn't enroll for this activity, please contact us immediately.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Enrollment Confirmed - ${activityTitle}`,
    html,
  });
};

/**
 * Send waitlist notification email
 */
export const sendWaitlistNotification = async (
  email: string,
  userName: string,
  activityTitle: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏳ Added to Waitlist</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>The activity <strong>${activityTitle}</strong> is currently full.</p>
            <p>You have been added to the waitlist. We'll notify you if a spot becomes available.</p>
            <p>Thank you for your interest!</p>
          </div>
          <div class="footer">
            <p>© 2026 Event Management System</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `Waitlisted - ${activityTitle}`,
    html,
  });
};

/**
 * Send password reset OTP email
 */
export const sendPasswordResetOTP = async (
  email: string,
  userName: string,
  otp: string
): Promise<boolean> => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .otp-box { background: white; padding: 20px; text-align: center; border: 2px dashed #667eea; border-radius: 10px; margin: 20px 0; }
          .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
            <div class="otp-box">
              <p class="otp-code">${otp}</p>
              <p style="color: #666; font-size: 14px; margin-top: 10px;">This code expires in 15 minutes</p>
            </div>
            <p>If you didn't request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© 2026 Event Management System. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Password Reset OTP - Event Management',
    html,
  });
};
