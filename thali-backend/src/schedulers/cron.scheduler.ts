// src/schedulers/cron.scheduler.ts
import cron from 'node-cron';
import { Queue } from 'bullmq';
import { bullMQRedisOptions } from '../config/redis';
import { QUEUE } from '../workers/index';

const spikeQueue    = new Queue(QUEUE.SPIKE_DETECTION, { connection: bullMQRedisOptions.connection });
const dailyQueue    = new Queue(QUEUE.DAILY_ORDERS,    { connection: bullMQRedisOptions.connection });

export function startCronScheduler() {
  // ── Cron 1: Fetch and update ingredient market prices (6:00 AM IST) ──
  // NOTE: In production, replace with actual market API call
  cron.schedule('30 0 * * *', () => {
    console.log('[Cron] 6:00 AM IST — Trigger ingredient price fetch (implement market API here)');
  }, { timezone: 'Asia/Kolkata' });

  // ── Cron 2: Detect price spikes across all subscriptions (7:00 AM IST) ──
  cron.schedule('30 1 * * *', async () => {
    console.log('[Cron] 7:00 AM IST — Detecting spikes');
    await spikeQueue.add('daily-spike-check', {}, { attempts: 3 });
  }, { timezone: 'Asia/Kolkata' });

  // ── Cron 3: Pre-create tomorrow's orders (11:00 PM IST) ─────────────
  cron.schedule('30 17 * * *', async () => {
    console.log('[Cron] 11:00 PM IST — Pre-creating tomorrow\'s orders');
    await dailyQueue.add('create-daily-orders', {}, { attempts: 3 });
  }, { timezone: 'Asia/Kolkata' });

  // ── Cron 4: Cleanup expired refresh tokens (3:00 AM IST) ────────────
  cron.schedule('30 21 * * *', async () => {
    const { prisma } = await import('../config/db');
    const deleted = await prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    console.log(`[Cron] 3:00 AM IST — Cleaned up ${deleted.count} expired refresh tokens`);
  }, { timezone: 'Asia/Kolkata' });

  // ── Cron 5: Cleanup old notifications > 90 days (4:00 AM IST) ───────
  cron.schedule('30 22 * * 0', async () => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    const { prisma } = await import('../config/db');
    const deleted = await prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });
    console.log(`[Cron] Weekly cleanup — Removed ${deleted.count} old notifications`);
  }, { timezone: 'Asia/Kolkata' });

  // ── Cron 6: Snapshot all meal prices to history (midnight IST) ───────
  cron.schedule('30 18 * * *', async () => {
    const { prisma } = await import('../config/db');
    const meals = await prisma.meal.findMany({ where: { isAvailable: true }, select: { id: true, currentPrice: true } });
    await prisma.mealPriceHistory.createMany({
      data: meals.map(m => ({ mealId: m.id, price: m.currentPrice })),
    });
    console.log(`[Cron] Midnight IST — Snapshotted ${meals.length} meal prices`);
  }, { timezone: 'Asia/Kolkata' });

  console.log('✅ Cron scheduler started (6 jobs registered)');
}
