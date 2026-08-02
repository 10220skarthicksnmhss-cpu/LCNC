// src/modules/notifications/channels/sms.channel.ts
import twilio from 'twilio';
import { env } from '../../../config/env';

export class SmsChannel {
  async send(to: string | null | undefined, body: string): Promise<void> {
    if (!to) { console.log('[SMS] No phone number — skipping'); return; }
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
      console.log('[SMS] Twilio not configured — skipping SMS');
      return;
    }

    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    await client.messages.create({ body, from: env.TWILIO_FROM_NUMBER!, to });
  }
}
