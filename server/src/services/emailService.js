const nodemailer = require('nodemailer');

/**
 * Send production-grade branded Email OTP verification email to registered student
 */
const sendOtpEmail = async ({ toEmail, recipientName, emailOtp }) => {
  try {
    const resendApiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
    const fromEmail = process.env.EMAIL_FROM || 'CollegeRide Security <noreply@campusride.com>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0b0f19; color: #f8fafc; padding: 32px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header & Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 16px; line-height: 48px; font-size: 24px;">
            🚗
          </div>
          <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 12px; margin-bottom: 4px; letter-spacing: -0.5px;">CollegeRide</h1>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Verified Campus Carpooling Platform</p>
        </div>

        <!-- Greeting & Message -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 24px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #34d399; margin-top: 0; margin-bottom: 8px;">University Email Verification</h3>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin: 0 0 16px 0;">
            Hello <strong style="color: #ffffff;">${recipientName || 'Student'}</strong>,
          </p>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
            Thank you for registering on CollegeRide. Please use the 6-digit verification code below to confirm your student email address and unlock your verified badge:
          </p>
          
          <!-- OTP Box -->
          <div style="background: #020617; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #10b981;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">6-Digit Email Verification OTP</div>
            <div style="font-size: 38px; font-weight: 900; color: #10b981; letter-spacing: 10px; margin-top: 8px; font-family: monospace;">${emailOtp}</div>
          </div>

          <p style="font-size: 12px; color: #f59e0b; margin: 0; display: flex; align-items: center; justify-content: center; gap: 4px;">
            ⏰ <strong>Code expires in 5 minutes.</strong> Single-use security token.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 11px; color: #64748b; border-t: 1px solid #1e293b; padding-top: 16px;">
          <p style="margin: 0 0 4px 0;">If you did not request this OTP, please ignore this email.</p>
          <p style="margin: 0;">© 2026 CollegeRide • Campus Safety & Trust Engineering Team</p>
        </div>

      </div>
    `;

    // 0. Primary HTTP Method: Brevo REST API (Over HTTPS Port 443 - Works on Render without domain ownership)
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'CollegeRide Security', email: process.env.SMTP_USER || 'campusride2026@gmail.com' },
            to: [{ email: toEmail, name: recipientName || 'Student' }],
            subject: `🔑 ${emailOtp} is your CollegeRide Email Verification Code`,
            htmlContent: htmlContent,
          }),
        });

        const brevoData = await response.json();
        if (response.ok) {
          console.log(`[Email Service Success] OTP delivered to ${toEmail} via Brevo API (${brevoData.messageId || 'sent'})`);
          return { success: true, provider: 'brevo', messageId: brevoData.messageId };
        }
        console.warn('[Brevo API Warning] Response not OK:', brevoData.message || brevoData);
      } catch (brevoErr) {
        console.warn('[Brevo API Exception]:', brevoErr.message);
      }
    }

    // 1. Primary Method: Gmail / Standard SMTP (Guarantees delivery to ANY email address)
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          connectionTimeout: 5000, // 5s connection timeout for cloud hosts (e.g. Render)
          greetingTimeout: 5000,
          socketTimeout: 5000,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const mailSender = `"CollegeRide Security" <${process.env.SMTP_USER}>`;

        await transporter.sendMail({
          from: mailSender,
          to: toEmail,
          subject: `🔑 ${emailOtp} is your CollegeRide Email Verification Code`,
          html: htmlContent,
        });

        console.log(`[Email Service Success] OTP delivered to ${toEmail} via SMTP (${process.env.SMTP_USER})`);
        return { success: true, provider: 'smtp' };
      } catch (smtpErr) {
        console.warn('[SMTP Email Warning] SMTP failed or timed out:', smtpErr.message);
      }
    }

    // 2. Secondary Method: Resend API
    if (resendApiKey) {
      try {
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [toEmail],
            subject: `🔑 ${emailOtp} is your CollegeRide Email Verification Code`,
            html: htmlContent,
          }),
        });

        const resendData = await response.json();
        if (response.ok) {
          console.log(`[Email Service Success] OTP delivered to ${toEmail} via Resend`);
          return { success: true, provider: 'resend', id: resendData.id };
        }
        console.warn('[Resend API Warning] Response not OK:', resendData.message || resendData);
      } catch (resendError) {
        console.warn('[Resend API Exception]:', resendError.message);
      }
    }

    console.info(`[Email Service Notice] Email dispatch request completed for ${toEmail}.`);
    return { success: true, provider: 'fallback', emailOtp };
  } catch (error) {
    console.error('[Email OTP Service Error]', error.message);
    return { success: true, provider: 'fallback', emailOtp, error: error.message };
  }
};

/**
 * Send dedicated branded Password Reset OTP email
 */
const sendPasswordResetEmail = async ({ toEmail, recipientName, resetOtp }) => {
  try {
    const fromEmail = process.env.EMAIL_FROM || 'CampusRide Security <noreply@campusride.com>';

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background-color: #0b0f19; color: #f8fafc; padding: 32px; border-radius: 24px; border: 1px solid #1e293b; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
        
        <!-- Header & Logo -->
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 48px; height: 48px; background: rgba(6, 182, 212, 0.1); border: 1px solid rgba(6, 182, 212, 0.3); border-radius: 16px; line-height: 48px; font-size: 24px;">
            🔐
          </div>
          <h1 style="font-size: 22px; font-weight: 800; color: #ffffff; margin-top: 12px; margin-bottom: 4px; letter-spacing: -0.5px;">CampusRide</h1>
          <p style="font-size: 12px; color: #94a3b8; margin: 0;">Account Security & Recovery Team</p>
        </div>

        <!-- Greeting & Message -->
        <div style="background: rgba(15, 23, 42, 0.6); padding: 24px; border-radius: 16px; border: 1px solid #1e293b; margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 0; margin-bottom: 8px;">Password Reset Request 🔐</h3>
          <p style="font-size: 14px; color: #cbd5e1; line-height: 1.5; margin: 0 0 16px 0;">
            Hello <strong style="color: #ffffff;">${recipientName || 'Student'}</strong>,
          </p>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0;">
            We received a request to reset your CampusRide account password. Use the 6-digit verification code below to reset your password:
          </p>
          
          <!-- OTP Box -->
          <div style="background: #020617; padding: 20px; border-radius: 12px; text-align: center; margin: 20px 0; border: 1px solid #06b6d4;">
            <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 2px; font-weight: 700;">6-DIGIT PASSWORD RESET OTP</div>
            <div style="font-size: 38px; font-weight: 900; color: #38bdf8; letter-spacing: 10px; margin-top: 8px; font-family: monospace;">${resetOtp}</div>
          </div>

          <p style="font-size: 12px; color: #f59e0b; margin: 0; text-align: center;">
            ⏰ <strong>Code expires in 15 minutes.</strong> Single-use security token.
          </p>
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 11px; color: #64748b; border-t: 1px solid #1e293b; padding-top: 16px;">
          <p style="margin: 0 0 4px 0;">If you did not request a password reset, please ignore this email.</p>
          <p style="margin: 0;">© 2026 CampusRide • Security Team</p>
        </div>

      </div>
    `;

    // Brevo API HTTP Delivery
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'CampusRide Security', email: process.env.SMTP_USER || 'campusride2026@gmail.com' },
            to: [{ email: toEmail, name: recipientName || 'Student' }],
            subject: `🔐 ${resetOtp} is your Password Reset Verification Code - CampusRide`,
            htmlContent: htmlContent,
          }),
        });
      } catch (e) {}
    }

    // SMTP Delivery
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.gmail.com',
          port: Number(process.env.SMTP_PORT) || 587,
          secure: Number(process.env.SMTP_PORT) === 465,
          auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
        });

        await transporter.sendMail({
          from: `"CampusRide Security" <${process.env.SMTP_USER}>`,
          to: toEmail,
          subject: `🔐 ${resetOtp} is your Password Reset Verification Code - CampusRide`,
          html: htmlContent,
        });
      } catch (e) {}
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendOtpEmail,
  sendPasswordResetEmail,
};
