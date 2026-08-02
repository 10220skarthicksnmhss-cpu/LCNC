// src/workers/index.ts — Register all BullMQ workers
import { Worker } from 'bullmq';
import { bullMQRedisOptions } from '../config/redis';
import { notificationService } from '../modules/notifications/notification.service';
import { recommendationService } from '../modules/recommendations/recommendation.service';
import { alertService } from '../modules/alerts/alert.service';
import { ingredientService } from '../modules/ingredients/ingredient.service';
import { orderService } from '../modules/orders/order.service';
import { AppEvent, eventBus } from '../events/event-bus';

// ── Queue Names ──────────────────────────────────────────────────────────
export const QUEUE = {
  NOTIFY:            'thali:notify',
  SUGGESTIONS:       'thali:suggestions',
  RESPONSE_TIMEOUT:  'thali:response-timeout',
  SPIKE_DETECTION:   'thali:spike-detection',
  DAILY_ORDERS:      'thali:daily-orders',
} as const;

// ── Worker: Send notification ────────────────────────────────────────────
export const notifyWorker = new Worker(
  QUEUE.NOTIFY,
  async (job) => {
    const { alertId } = job.data;
    await notificationService.sendAlertNotification(alertId);
    console.log(`[Worker:Notify] Alert ${alertId} notifications sent`);
  },
  { connection: bullMQRedisOptions.connection, concurrency: 10 },
);

// ── Worker: Generate AI suggestions ─────────────────────────────────────
export const suggestionsWorker = new Worker(
  QUEUE.SUGGESTIONS,
  async (job) => {
    const { alertId } = job.data;
    await recommendationService.generateSuggestions(alertId);
    console.log(`[Worker:Suggestions] Suggestions generated for alert ${alertId}`);
  },
  { connection: bullMQRedisOptions.connection, concurrency: 5 },
);

// ── Worker: Handle response timeout ─────────────────────────────────────
export const responseTimeoutWorker = new Worker(
  QUEUE.RESPONSE_TIMEOUT,
  async (job) => {
    const { alertId } = job.data;
    await alertService.handleTimeout(alertId);
    console.log(`[Worker:Timeout] Timeout handled for alert ${alertId}`);
  },
  { connection: bullMQRedisOptions.connection, concurrency: 5 },
);

// ── Worker: Detect price spikes ──────────────────────────────────────────
export const spikeDetectionWorker = new Worker(
  QUEUE.SPIKE_DETECTION,
  async (_job) => {
    const count = await alertService.detectSpikesForToday();
    console.log(`[Worker:SpikeDetect] ${count} alerts created`);
  },
  { connection: bullMQRedisOptions.connection, concurrency: 1 },
);

// ── Worker: Create daily orders ──────────────────────────────────────────
export const dailyOrdersWorker = new Worker(
  QUEUE.DAILY_ORDERS,
  async (_job) => {
    const count = await orderService.createDailyOrders();
    console.log(`[Worker:DailyOrders] ${count} orders pre-created for tomorrow`);
  },
  { connection: bullMQRedisOptions.connection, concurrency: 1 },
);

// ── Error handlers ───────────────────────────────────────────────────────
for (const worker of [notifyWorker, suggestionsWorker, responseTimeoutWorker, spikeDetectionWorker, dailyOrdersWorker]) {
  worker.on('failed', (job, err) => {
    console.error(`[Worker:${worker.name}] Job ${job?.id} failed:`, err.message);
  });
  worker.on('completed', (job) => {
    console.log(`[Worker:${worker.name}] Job ${job?.id} completed`);
  });
}

// ── Event bus → Queue bridge ─────────────────────────────────────────────
// When a spike is detected, auto-enqueue suggestions + notification + timeout jobs
import { Queue } from 'bullmq';
const notifyQueue     = new Queue(QUEUE.NOTIFY,           { connection: bullMQRedisOptions.connection });
const suggestQueue    = new Queue(QUEUE.SUGGESTIONS,      { connection: bullMQRedisOptions.connection });
const timeoutQueue    = new Queue(QUEUE.RESPONSE_TIMEOUT, { connection: bullMQRedisOptions.connection });

eventBus.on(AppEvent.PriceSpikeDetected, async (payload) => {
  const { alertId } = payload;

  // 1. Generate suggestions immediately
  await suggestQueue.add('generate', { alertId }, { attempts: 3 });

  // 2. Send notification (will wait for suggestions to be ready via delay)
  await notifyQueue.add('alert-notify', { alertId }, {
    delay: 5_000, // 5s delay to allow suggestions to complete first
    attempts: 3,
  });

  // 3. Schedule timeout job at lockAt time (enqueue with delay)
  // lockAt is stored on the alert; pull it fresh
  const { prisma } = await import('../config/db');
  const alert = await prisma.priceAlert.findUnique({ where: { id: alertId }, select: { lockAt: true } });
  if (alert) {
    const delayMs = Math.max(0, alert.lockAt.getTime() - Date.now());
    await timeoutQueue.add('response-timeout', { alertId }, { delay: delayMs, attempts: 3, jobId: `timeout:${alertId}` });
  }
});

console.log('✅ All BullMQ workers registered and running');
