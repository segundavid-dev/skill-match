import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: { user: env.smtp.user, pass: env.smtp.pass },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (opts: EmailOptions): Promise<void> => {
  try {
    if (env.isDev() && !env.smtp.user) {
      logger.info(`[DEV EMAIL] To: ${opts.to} | Subject: ${opts.subject}`);
      return;
    }
    await transporter.sendMail({ from: env.smtp.from, ...opts });
    logger.info(`Email sent to ${opts.to}`);
  } catch (err) {
    logger.error('Email send failed', { err });
  }
};

// ── Email Templates ──────────────────────────────────────────────────────────
export const emailTemplates = {
  verifyEmail: (name: string, token: string, clientUrl: string) => ({
    subject: 'Verify your SkillMatch account 🌱',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px">
        <h1 style="color:#10B981;font-size:28px;margin-bottom:8px">Welcome to SkillMatch, ${name}! 🎉</h1>
        <p style="color:#475569;font-size:16px;line-height:1.7">
          You're one step away from matching your skills with causes that matter.
          Click below to verify your email address.
        </p>
        <a href="${clientUrl}/verify-email?token=${token}"
          style="display:inline-block;margin:24px 0;padding:14px 32px;background:linear-gradient(135deg,#10B981,#059669);
          color:white;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px">
          Verify My Email →
        </a>
        <p style="color:#94A3B8;font-size:13px">
          This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  }),

  passwordReset: (name: string, token: string, clientUrl: string) => ({
    subject: 'Reset your SkillMatch password 🔐',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px">
        <h1 style="color:#10B981;font-size:24px">Password Reset Request</h1>
        <p style="color:#475569;font-size:16px;line-height:1.7">Hi ${name}, we received a request to reset your password.</p>
        <a href="${clientUrl}/reset-password?token=${token}"
          style="display:inline-block;margin:24px 0;padding:14px 32px;background:#EF4444;
          color:white;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px">
          Reset Password →
        </a>
        <p style="color:#94A3B8;font-size:13px">
          This link expires in 1 hour. If you didn't request this, please ignore it.
        </p>
      </div>
    `,
  }),

  newMatch: (volunteerName: string, orgName: string, role: string, clientUrl: string) => ({
    subject: `🎉 It's a Match! You matched with ${orgName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:40px 24px;background:#0F3D2E;color:white;border-radius:16px">
        <h1 style="font-size:36px;margin-bottom:8px">🎉 It's a Match!</h1>
        <p style="color:#A7F3D0;font-size:18px;line-height:1.7">
          Hi ${volunteerName}! <strong>${orgName}</strong> is also interested in connecting with you for the <strong>${role}</strong> role.
        </p>
        <a href="${clientUrl}/matches"
          style="display:inline-block;margin:24px 0;padding:14px 32px;background:linear-gradient(135deg,#10B981,#059669);
          color:white;text-decoration:none;border-radius:50px;font-weight:700;font-size:16px">
          Message Them Now 💬 →
        </a>
      </div>
    `,
  }),
};
