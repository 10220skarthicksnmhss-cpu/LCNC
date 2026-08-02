// src/modules/subscriptions/subscription.service.ts
import { prisma } from '../../config/db';
import { AppError } from '../../shared/errors/AppError';
import { AutoSwitchPref, SubStatus } from '@prisma/client';
import { z } from 'zod';

export const CreateSubscriptionSchema = z.object({
  mealId:         z.string().uuid(),
  deliveryTime:   z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Use HH:MM format'),
  deliveryDays:   z.array(z.number().int().min(1).max(7)).default([1,2,3,4,5,6,7]),
  addressId:      z.string().uuid().optional(),
  alertThreshold: z.number().int().min(5).max(50).default(20),
  autoSwitchPref: z.enum(['always_ask', 'ai_auto_switch', 'keep_original']).default('ai_auto_switch'),
  budgetLimit:    z.number().int().positive().optional(),
});

export const UpdateSubscriptionSchema = z.object({
  deliveryTime:   z.string().regex(/^([0-1]\d|2[0-3]):[0-5]\d$/).optional(),
  deliveryDays:   z.array(z.number().int().min(1).max(7)).optional(),
  alertThreshold: z.number().int().min(5).max(50).optional(),
  autoSwitchPref: z.enum(['always_ask', 'ai_auto_switch', 'keep_original']).optional(),
  budgetLimit:    z.number().int().positive().optional(),
  status:         z.enum(['active', 'paused']).optional(),
});

const autoSwitchMap: Record<string, AutoSwitchPref> = {
  always_ask: AutoSwitchPref.ALWAYS_ASK,
  ai_auto_switch: AutoSwitchPref.AI_AUTO_SWITCH,
  keep_original: AutoSwitchPref.KEEP_ORIGINAL,
};

export class SubscriptionService {
  async create(userId: string, dto: z.infer<typeof CreateSubscriptionSchema>) {
    // Validate meal exists and is available
    const meal = await prisma.meal.findFirst({
      where: { id: dto.mealId, isAvailable: true },
      include: { restaurant: { select: { opensAt: true, closesAt: true } } },
    });
    if (!meal) throw AppError.notFound('Meal');

    // Validate delivery time within restaurant hours
    const [h, m] = dto.deliveryTime.split(':').map(Number);
    const [oh, om] = meal.restaurant.opensAt.split(':').map(Number);
    const [ch, cm] = meal.restaurant.closesAt.split(':').map(Number);
    const deliveryMinutes  = h * 60 + m;
    const opensMinutes     = oh * 60 + om;
    const closesMinutes    = ch * 60 + cm;

    if (deliveryMinutes < opensMinutes || deliveryMinutes > closesMinutes) {
      throw AppError.unprocessable(
        `Restaurant is only open ${meal.restaurant.opensAt}–${meal.restaurant.closesAt}. Choose a delivery time within those hours.`
      );
    }

    // Check for duplicate active subscription
    const existing = await prisma.subscription.findFirst({
      where: { userId, mealId: dto.mealId, deliveryTime: dto.deliveryTime, status: SubStatus.ACTIVE },
    });
    if (existing) throw AppError.conflict('You already have an active subscription for this meal at this time');

    return prisma.subscription.create({
      data: {
        userId,
        mealId: dto.mealId,
        deliveryTime: dto.deliveryTime,
        deliveryDays: dto.deliveryDays,
        addressId:    dto.addressId,
        alertThreshold: dto.alertThreshold,
        autoSwitchPref: autoSwitchMap[dto.autoSwitchPref],
        budgetLimit: dto.budgetLimit,
      },
    });
  }

  async list(userId: string) {
    const subs = await prisma.subscription.findMany({
      where: { userId, status: { not: SubStatus.CANCELLED } },
      include: { meal: { select: { name: true, cuisine: true, currentPrice: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return subs.map(s => ({
      id:           s.id,
      mealId:       s.mealId,
      meal:         s.meal.name,
      cuisine:      s.meal.cuisine,
      deliveryTime: this.formatTime(s.deliveryTime),
      status:       s.status.toLowerCase(),
      price:        Number(s.meal.currentPrice),
      threshold:    s.alertThreshold,
      autoSwitch:   s.autoSwitchPref === AutoSwitchPref.AI_AUTO_SWITCH,
    }));
  }

  async update(userId: string, subId: string, dto: z.infer<typeof UpdateSubscriptionSchema>) {
    const sub = await this.assertOwnership(userId, subId);
    if (sub.status === SubStatus.CANCELLED) throw AppError.unprocessable('Cannot update a cancelled subscription');

    const data: any = {};
    if (dto.deliveryTime)   data.deliveryTime   = dto.deliveryTime;
    if (dto.deliveryDays)   data.deliveryDays   = dto.deliveryDays;
    if (dto.alertThreshold) data.alertThreshold = dto.alertThreshold;
    if (dto.autoSwitchPref) data.autoSwitchPref = autoSwitchMap[dto.autoSwitchPref];
    if (dto.budgetLimit)    data.budgetLimit    = dto.budgetLimit;
    if (dto.status)         data.status         = dto.status === 'active' ? SubStatus.ACTIVE : SubStatus.PAUSED;

    return prisma.subscription.update({ where: { id: subId }, data });
  }

  async cancel(userId: string, subId: string) {
    await this.assertOwnership(userId, subId);
    await prisma.subscription.update({
      where: { id: subId },
      data: { status: SubStatus.CANCELLED, cancelledAt: new Date() },
    });
  }

  private async assertOwnership(userId: string, subId: string) {
    const sub = await prisma.subscription.findUnique({ where: { id: subId } });
    if (!sub) throw AppError.notFound('Subscription');
    if (sub.userId !== userId) throw AppError.forbidden();
    return sub;
  }

  private formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}

export const subscriptionService = new SubscriptionService();
