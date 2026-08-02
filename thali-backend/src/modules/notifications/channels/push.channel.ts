// src/modules/notifications/channels/push.channel.ts
// Firebase FCM Push Notifications
import * as admin from 'firebase-admin';
import { env } from '../../../config/env';
import { redis } from '../../../config/redis';

let initialized = false;

function getApp(): admin.app.App {
  if (!initialized && env.FIREBASE_PROJECT_ID && env.FIREBASE_PRIVATE_KEY && env.FIREBASE_CLIENT_EMAIL) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:   env.FIREBASE_PROJECT_ID,
        privateKey:  env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    initialized = true;
  }
  return admin.app();
}

export class PushChannel {
  async send(userId: string, title: string, body: string): Promise<void> {
    if (!env.FIREBASE_PROJECT_ID) {
      console.log('[Push] Firebase not configured — skipping push notification');
      return;
    }

    const fcmToken = await redis.get(`fcm:${userId}`);
    if (!fcmToken) {
      console.log(`[Push] No FCM token for user ${userId}`);
      return;
    }

    await getApp().messaging().send({ token: fcmToken, notification: { title, body } });
  }

  /** Store FCM token for a user (called on login) */
  async registerToken(userId: string, token: string): Promise<void> {
    await redis.set(`fcm:${userId}`, token, 'EX', 30 * 24 * 3600); // 30 days
  }
}
