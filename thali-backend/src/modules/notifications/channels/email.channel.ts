// src/modules/notifications/channels/email.channel.ts
import nodemailer from 'nodemailer';
import { env } from '../../../config/env';

export class EmailChannel {
  private transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: env.SMTP_USER
      ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
      : undefined,
  });

  async send(to: string, subject: string, text: string): Promise<void> {
    if (!env.SMTP_USER) {
      console.log(`[Email] SMTP not configured — skipping email to ${to}`);
      return;
    }

    await this.transporter.sendMail({
      from:    env.SMTP_FROM,
      to,
      subject,
      text,
      html: `<div style="font-family:sans-serif;max-width:600px;margin:auto">
               <h2 style="color:#E53E3E">🍽️ Thali Price Alert</h2>
               <p>${text}</p>
               <a href="${env.API_BASE_URL}" style="background:#E53E3E;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none">
                 View & Respond in App
               </a>
             </div>`,
    });
  }
}
