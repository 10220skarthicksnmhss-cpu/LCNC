// src/modules/notifications/notification.service.ts
import { prisma } from '../../config/db';
import { NotifChannel } from '@prisma/client';
import { PushChannel } from './channels/push.channel';
import { SmsChannel } from './channels/sms.channel';
import { EmailChannel } from './channels/email.channel';

interface SendNotificationInput {
  userId:   string;
  alertId?: string;
  orderId?: string;
  title:    string;
  body:     string;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  private push  = new PushChannel();
  private sms   = new SmsChannel();
  private email = new EmailChannel();

  async sendAlertNotification(alertId: string): Promise<void> {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
      include: {
        meal: { select: { name: true } },
        subscription: {
          include: {
            user: {
              select: {
                id: true, name: true, email: true, phone: true,
                preferences: { select: { notifPush: true, notifSms: true, notifEmail: true } },
              },
            },
          },
        },
      },
    });

    if (!alert) return;

    const user  = alert.subscription.user;
    const prefs = user.preferences;
    if (!prefs) return;

    const spikePct  = Math.round(Number(alert.spikePct));
    const title     = `⚠️ Price Alert: ${alert.meal.name}`;
    const body      = `${alert.meal.name} price rose ${spikePct}% (₹${Number(alert.oldPrice)} → ₹${Number(alert.newPrice)}). ${alert.spikeReason ?? ''}. Respond by ${alert.respondDeadline.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}.`;

    const channels: { active: boolean; channel: NotifChannel }[] = [
      { active: prefs.notifPush,  channel: NotifChannel.PUSH },
      { active: prefs.notifSms,   channel: NotifChannel.SMS },
      { active: prefs.notifEmail, channel: NotifChannel.EMAIL },
    ];

    for (const { active, channel } of channels) {
      if (!active) continue;
      await this.dispatch({ userId: user.id, alertId, title, body }, channel, user);
    }
  }

  private async dispatch(input: SendNotificationInput, channel: NotifChannel, user: any): Promise<void> {
    let sent = false;
    try {
      if (channel === NotifChannel.PUSH)  await this.push.send(user.id, input.title, input.body);
      if (channel === NotifChannel.SMS)   await this.sms.send(user.phone, input.body);
      if (channel === NotifChannel.EMAIL) await this.email.send(user.email, input.title, input.body);
      sent = true;
    } catch (err) {
      console.error(`[Notification] Failed to send ${channel}:`, err);
    }

    await prisma.notification.create({
      data: {
        userId:   input.userId,
        alertId:  input.alertId,
        orderId:  input.orderId,
        channel,
        title:    input.title,
        body:     input.body,
        metadata: (input.metadata ?? {}) as Record<string, string | number | boolean | null>,
        sentAt:   sent ? new Date() : undefined,
        delivered: sent,
      },
    });
  }
}

export const notificationService = new NotificationService();
