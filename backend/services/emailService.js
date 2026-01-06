const nodemailer = require('nodemailer');

/**
 * Email Service - Handles all email operations using Nodemailer
 * Supports Gmail, Zoho, and custom SMTP configurations
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.adminEmail = process.env.ADMIN_EMAIL || 'itsfake0420@gmail.com';
    this.fromName = process.env.EMAIL_FROM_NAME || 'BannerMind';
    this.fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER;
    
    this.initialize();
  }

  /**
   * Initialize the email transporter
   */
  initialize() {
    try {
      // Check if SMTP credentials are configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        return;
      }

      // Create transporter based on configuration
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        // Gmail specific settings
        ...(process.env.SMTP_HOST === 'smtp.gmail.com' && {
          service: 'gmail'
        })
      });

      this.isConfigured = true;
      console.log('✅ Email service initialized successfully');
      
      // Verify connection
      this.verifyConnection();
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    if (!this.transporter) return false;
    
    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified');
      return true;
    } catch (error) {
      console.error('❌ SMTP verification failed:', error.message);
      return false;
    }
  }

  /**
   * Send email
   */
  async sendEmail({ to, subject, html, text }) {
    if (!this.isConfigured || !this.transporter) {
      console.warn('⚠️ Email service not configured. Email not sent.');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const mailOptions = {
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent: ${info.messageId}`);
      
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Email sending failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(contact) {
    const subject = `🎫 New Contact: ${contact.token} - ${contact.name}`;
    const html = this.getAdminEmailTemplate(contact);
    
    return this.sendEmail({
      to: this.adminEmail,
      subject,
      html
    });
  }

  /**
   * Send user confirmation email
   */
  async sendUserConfirmation(contact) {
    const subject = `✅ We received your message - Ticket #${contact.token}`;
    const html = this.getUserEmailTemplate(contact);
    
    return this.sendEmail({
      to: contact.email,
      subject,
      html
    });
  }

  /**
   * Admin notification email template
   */
  getAdminEmailTemplate(contact) {
    const formattedDate = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(contact.createdAt || new Date());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0d12;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%);">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                🎫 New Contact Message
              </h1>
              <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
                Ticket ID: <strong>${contact.token}</strong>
              </p>
            </td>
          </tr>

          <!-- Ticket Badge -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 12px; padding: 20px; text-align: center;">
                <span style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; font-size: 24px; font-weight: 700; padding: 12px 24px; border-radius: 8px; letter-spacing: 2px;">
                  ${contact.token}
                </span>
              </div>
            </td>
          </tr>

          <!-- Contact Details -->
          <tr>
            <td style="padding: 20px 40px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                
                <!-- Name -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <p style="margin: 0 0 5px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">From</p>
                    <p style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">${contact.name}</p>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <p style="margin: 0 0 5px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Email</p>
                    <a href="mailto:${contact.email}" style="color: #8b5cf6; font-size: 16px; text-decoration: none;">${contact.email}</a>
                  </td>
                </tr>

                <!-- Date -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <p style="margin: 0 0 5px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Received At</p>
                    <p style="margin: 0; color: #e2e8f0; font-size: 14px;">${formattedDate}</p>
                  </td>
                </tr>

                <!-- Status -->
                <tr>
                  <td style="padding: 15px 0; border-bottom: 1px solid rgba(139, 92, 246, 0.2);">
                    <p style="margin: 0 0 5px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Status</p>
                    <span style="display: inline-block; background: #22c55e; color: #ffffff; font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px;">${contact.status}</span>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding: 20px 40px;">
              <p style="margin: 0 0 10px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Message</p>
              <div style="background: rgba(15, 15, 25, 0.6); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px;">
                <p style="margin: 0; color: #e2e8f0; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${contact.message}</p>
              </div>
            </td>
          </tr>

          <!-- Reply Button -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td align="center">
                    <a href="mailto:${contact.email}?subject=Re: ${contact.token} - Your inquiry at BannerMind" style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);">
                      ↩️ Reply to ${contact.name}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background: rgba(0, 0, 0, 0.3); text-align: center;">
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                BannerMind Admin Notification • ${new Date().getFullYear()}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * User confirmation email template
   */
  getUserEmailTemplate(contact) {
    const formattedDate = new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata'
    }).format(contact.createdAt || new Date());

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message Received - BannerMind</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0d0d12;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(139, 92, 246, 0.15);">
          
          <!-- Header with Logo -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%);">
              <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                BannerMind
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.9); font-size: 14px;">
                AI-Powered Banner Creation
              </p>
            </td>
          </tr>

          <!-- Thank You Section -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center;">
              <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">✅</span>
              </div>
              <h2 style="margin: 0 0 10px; color: #ffffff; font-size: 24px; font-weight: 600;">
                Thank you, ${contact.name}!
              </h2>
              <p style="margin: 0; color: #94a3b8; font-size: 16px; line-height: 1.6;">
                We've received your message and our team is on it.
              </p>
            </td>
          </tr>

          <!-- Ticket Info Card -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%); border: 1px solid rgba(139, 92, 246, 0.3); border-radius: 16px; padding: 30px; text-align: center;">
                <p style="margin: 0 0 10px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Your Ticket Number</p>
                <div style="display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); color: #ffffff; font-size: 28px; font-weight: 700; padding: 16px 32px; border-radius: 12px; letter-spacing: 3px; box-shadow: 0 8px 30px rgba(139, 92, 246, 0.4);">
                  ${contact.token}
                </div>
                <p style="margin: 15px 0 0; color: #64748b; font-size: 13px;">
                  📅 ${formattedDate}
                </p>
              </div>
            </td>
          </tr>

          <!-- What's Next -->
          <tr>
            <td style="padding: 20px 40px;">
              <h3 style="margin: 0 0 15px; color: #ffffff; font-size: 18px; font-weight: 600;">
                ⏰ What happens next?
              </h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #a855f7;">1</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; color: #e2e8f0; font-size: 14px;">Our team will review your message</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #a855f7;">2</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; color: #e2e8f0; font-size: 14px;">You'll receive a response within <strong style="color: #22c55e;">24-48 hours</strong></p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 12px 0; vertical-align: top;">
                    <table role="presentation" style="border-collapse: collapse;">
                      <tr>
                        <td style="width: 32px; vertical-align: top;">
                          <div style="width: 24px; height: 24px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; text-align: center; line-height: 24px; font-size: 12px; color: #a855f7;">3</div>
                        </td>
                        <td style="padding-left: 12px;">
                          <p style="margin: 0; color: #e2e8f0; font-size: 14px;">Use ticket <strong style="color: #a855f7;">${contact.token}</strong> for any follow-ups</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Your Message Summary -->
          <tr>
            <td style="padding: 20px 40px;">
              <div style="background: rgba(15, 15, 25, 0.6); border: 1px solid rgba(139, 92, 246, 0.2); border-radius: 12px; padding: 20px;">
                <p style="margin: 0 0 10px; color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Message</p>
                <p style="margin: 0; color: #94a3b8; font-size: 14px; line-height: 1.6; font-style: italic; white-space: pre-wrap;">"${contact.message.length > 200 ? contact.message.substring(0, 200) + '...' : contact.message}"</p>
              </div>
            </td>
          </tr>

          <!-- Contact Info -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <div style="background: rgba(139, 92, 246, 0.1); border-radius: 12px; padding: 20px; text-align: center;">
                <p style="margin: 0 0 10px; color: #e2e8f0; font-size: 14px;">
                  Need urgent help? Reach us directly:
                </p>
                <a href="mailto:contact@bannermind.in" style="color: #8b5cf6; font-size: 16px; font-weight: 600; text-decoration: none;">
                  📧 contact@bannermind.in
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 25px 40px; background: rgba(0, 0, 0, 0.3); text-align: center;">
              <p style="margin: 0 0 10px; color: #94a3b8; font-size: 14px;">
                Thank you for choosing BannerMind! 🚀
              </p>
              <p style="margin: 0; color: #64748b; font-size: 12px;">
                © ${new Date().getFullYear()} BannerMind. All rights reserved.
              </p>
              <p style="margin: 10px 0 0; color: #475569; font-size: 11px;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;
  }

  /**
   * Strip HTML tags for plain text fallback
   */
  stripHtml(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

// Export singleton instance
module.exports = new EmailService();








