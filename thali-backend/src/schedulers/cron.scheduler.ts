// src/schedulers/cron.scheduler.ts
import cron from 'node-cron';
import { alertService } from '../modules/alerts/alert.service';
import { orderService } from '../modules/orders/order.service';

export function startCronScheduler(): void {
  // Detect price spikes every day at 06:00 IST
  cron.schedule('0 6 * * *', async () => {
    console.log('[Cron] detectSpikesForToday — starting');
    try {
      const count = await alertService.detectSpikesForToday();
      console.log(`[Cron] detectSpikesForToday — ${count} alert(s) created`);
    } catch (err) {
      console.error('[Cron] detectSpikesForToday failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Kolkata' });

  // Pre-create tomorrow orders every day at 23:00 IST
  cron.schedule('0 23 * * *', async () => {
    console.log('[Cron] createDailyOrders — starting');
    try {
      const count = await orderService.createDailyOrders();
      console.log(`[Cron] createDailyOrders — ${count} order(s) created`);
    } catch (err) {
      console.error('[Cron] createDailyOrders failed:', (err as Error).message);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[Cron] Scheduler started (spikes: 6AM IST, orders: 11PM IST)');
}
