// src/modules/alerts/alert.service.ts
import { prisma } from '../../config/db';
import { AppError } from '../../shared/errors/AppError';
import { AlertStatus, AutoSwitchPref, OrderStatus, SubStatus } from '@prisma/client';
import { calculateAlertWindow, isDeadlinePassed, secondsUntil } from '../../shared/utils/date.utils';
import { calcSpikePct } from '../../shared/utils/price.utils';
import { eventBus, AppEvent } from '../../events/event-bus';

export class AlertService {
  /**
   * Called by scheduler: Scans all active subscriptions for today's deliveries.
   * Creates a PriceAlert if price has spiked beyond the user's threshold.
   */
  async detectSpikesForToday(): Promise<number> {
    const today = new Date();
    const todayDay = today.getDay() || 7; // convert 0=Sunday to 7

    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: SubStatus.ACTIVE,
        deliveryDays: { has: todayDay },
      },
      include: {
        meal: { select: { id: true, name: true, currentPrice: true } },
        user: { select: { id: true } },
      },
    });

    let alertsCreated = 0;

    for (const sub of activeSubs) {
      // Get yesterday's price
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const yesterdayRecord = await prisma.mealPriceHistory.findFirst({
        where: {
          mealId: sub.mealId,
          recordedAt: { gte: yesterday, lt: todayStart },
        },
        orderBy: { recordedAt: 'desc' },
      });

      const oldPrice = yesterdayRecord ? Number(yesterdayRecord.price) : Number(sub.meal.currentPrice);
      const newPrice = Number(sub.meal.currentPrice);
      const spikePct = calcSpikePct(oldPrice, newPrice);

      if (!spikePct || spikePct <= sub.alertThreshold) continue;

      // Check if alert already created today for this subscription
      const existingAlert = await prisma.priceAlert.findFirst({
        where: { subscriptionId: sub.id, deliveryDate: todayStart, status: { in: [AlertStatus.PENDING] } },
      });
      if (existingAlert) continue;

      // Calculate alert timing window
      const window = calculateAlertWindow(today, sub.deliveryTime);

      // Identify the spike reason (biggest spiked ingredient)
      const spikeReason = await this.buildSpikeReason(sub.mealId);

      const alert = await prisma.priceAlert.create({
        data: {
          subscriptionId: sub.id,
          mealId: sub.mealId,
          originalMealId: sub.mealId,
          deliveryDate: todayStart,
          oldPrice,
          newPrice,
          spikePct,
          spikeReason,
          notifyAt: window.notifyAt,
          respondDeadline: window.respondDeadline,
          lockAt: window.lockAt,
        },
      });

      alertsCreated++;

      eventBus.emit(AppEvent.PriceSpikeDetected, {
        alertId:        alert.id,
        userId:         sub.userId,
        subscriptionId: sub.id,
        mealId:         sub.mealId,
        mealName:       sub.meal.name,
        oldPrice,
        newPrice,
        spikePct,
        spikeReason: spikeReason ?? 'Ingredient price change',
      });
    }

    return alertsCreated;
  }

  /** Returns active alerts for a user with time remaining */
  async getActiveAlerts(userId: string) {
    const alerts = await prisma.priceAlert.findMany({
      where: {
        subscription: { userId },
        status: AlertStatus.PENDING,
      },
      include: {
        meal: true,
        aiSuggestions: {
          include: { meal: true },
          orderBy: { rank: 'asc' },
          take: 3,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return alerts.map(alert => ({
      id:             alert.id,
      subscriptionId: alert.subscriptionId,
      meal:           alert.meal.name,
      oldPrice:       Number(alert.oldPrice),
      newPrice:       Number(alert.newPrice),
      spikePct:       Number(alert.spikePct),
      reason:         alert.spikeReason ?? '',
      status:         alert.status.toLowerCase(),
      timeLeftSeconds: secondsUntil(alert.respondDeadline),
      respondDeadline: alert.respondDeadline.toISOString(),
      aiSuggestions: alert.aiSuggestions.map(s => ({
        rank:       s.rank,
        matchScore: s.matchScore,
        mealId:     s.mealId,
        mealName:   s.meal.name,
        price:      Number(s.meal.currentPrice),
        reasons:    s.reasonJson ?? {},
      })),
    }));
  }

  /** User responds to an alert: keep | ai_swap | pick_other */
  async respond(userId: string, alertId: string, action: 'keep' | 'ai_swap' | 'pick_other', selectedMealId?: string) {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId },
      include: {
        subscription: { select: { userId: true } },
        aiSuggestions: { orderBy: { rank: 'asc' }, take: 1, include: { meal: { select: { id: true, name: true, currentPrice: true } } } },
        meal: { select: { name: true } },
      },
    });

    if (!alert) throw AppError.notFound('Alert');
    if (alert.subscription.userId !== userId) throw AppError.forbidden();
    if (alert.status !== AlertStatus.PENDING) throw AppError.conflict('Alert has already been responded to or locked');
    if (isDeadlinePassed(alert.respondDeadline)) throw AppError.unprocessable('Response deadline has passed');

    let finalMealId = alert.originalMealId;
    let finalPrice  = Number(alert.newPrice);
    let newStatus: AlertStatus  = AlertStatus.USER_KEPT;
    let decisionTrail = '';

    if (action === 'keep') {
      newStatus     = AlertStatus.USER_KEPT;
      decisionTrail = `User chose to keep ${alert.meal.name} at the new price ₹${finalPrice}.`;
    } else if (action === 'ai_swap') {
      const topSuggestion = alert.aiSuggestions[0];
      if (!topSuggestion) throw AppError.unprocessable('No AI suggestions available for this alert');
      finalMealId   = topSuggestion.mealId;
      finalPrice    = Number(topSuggestion.meal.currentPrice);
      newStatus     = AlertStatus.USER_SWAPPED;
      decisionTrail = `User accepted AI suggestion: ${topSuggestion.meal.name} at ₹${finalPrice}. Match score: ${topSuggestion.matchScore}%.`;
    } else if (action === 'pick_other') {
      if (!selectedMealId) throw AppError.badRequest('selectedMealId is required for pick_other action');
      const meal = await prisma.meal.findFirst({ where: { id: selectedMealId, isAvailable: true } });
      if (!meal) throw AppError.notFound('Selected meal');
      finalMealId   = meal.id;
      finalPrice    = Number(meal.currentPrice);
      newStatus     = AlertStatus.USER_PICKED_OTHER;
      decisionTrail = `User picked ${meal.name} (₹${finalPrice}) from the meal browser.`;
    }

    // Update alert
    await prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        status: newStatus,
        finalMealId,
        finalPrice,
        userRespondedAt: new Date(),
      },
    });

    // Lock the order with user's choice
    await this.lockOrder(alert.subscriptionId, alertId, finalMealId, finalPrice, false, decisionTrail);

    eventBus.emit(AppEvent.UserResponded, { alertId, action, finalMealId, finalPrice });

    return { alertId, action, finalMealId, finalPrice, decisionTrail };
  }

  /** Called by timeout job when respond_deadline passes */
  async handleTimeout(alertId: string): Promise<void> {
    const alert = await prisma.priceAlert.findFirst({
      where: { id: alertId, status: AlertStatus.PENDING },
      include: {
        subscription: true,
        aiSuggestions: { orderBy: { rank: 'asc' }, take: 1, include: { meal: { select: { id: true, name: true, currentPrice: true } } } },
        meal: { select: { name: true } },
      },
    });

    if (!alert) return; // Already handled

    let finalMealId = alert.originalMealId;
    let finalPrice  = Number(alert.newPrice);
    let aiDecision  = false;
    let newStatus: AlertStatus  = AlertStatus.TIMED_OUT;
    let decisionTrail = '';

    const pref = alert.subscription.autoSwitchPref;

    if (pref === AutoSwitchPref.AI_AUTO_SWITCH && alert.aiSuggestions[0]) {
      const top = alert.aiSuggestions[0];
      finalMealId   = top.mealId;
      finalPrice    = Number(top.meal.currentPrice);
      aiDecision    = true;
      newStatus     = AlertStatus.AI_SWITCHED;
      decisionTrail = `AI selected ${top.meal.name} — price spike ${Math.round(Number(alert.spikePct))}%, auto-switch was on, match score ${top.matchScore}%.`;
    } else if (pref === AutoSwitchPref.KEEP_ORIGINAL) {
      decisionTrail = `User did not respond. Subscription set to always keep original. ${alert.meal.name} kept at ₹${finalPrice}.`;
    } else {
      // ALWAYS_ASK — keep original, charge new price
      decisionTrail = `User did not respond. Subscription set to 'always ask'. Original meal kept at new price ₹${finalPrice}.`;
    }

    await prisma.priceAlert.update({
      where: { id: alertId },
      data: { status: newStatus, finalMealId, finalPrice },
    });

    await this.lockOrder(alert.subscriptionId, alertId, finalMealId, finalPrice, aiDecision, decisionTrail);

    eventBus.emit(AppEvent.ResponseTimeout, { alertId, pref, finalMealId });
  }

  private async lockOrder(
    subscriptionId: string,
    alertId: string,
    mealId: string,
    finalPrice: number,
    aiDecision: boolean,
    decisionTrail: string,
  ) {
    // Find the pending order for this subscription today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const order = await prisma.order.findFirst({
      where: {
        subscriptionId,
        deliveryDate: today,
        status: { in: [OrderStatus.PENDING, OrderStatus.CONFIRMED] },
      },
    });

    if (!order) return;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        mealId,
        finalPrice,
        aiDecision,
        decisionTrail,
        status: OrderStatus.LOCKED,
        lockedAt: new Date(),
      },
    });

    await prisma.orderStatusHistory.create({
      data: { orderId: order.id, status: OrderStatus.LOCKED, note: 'Order locked after alert resolution' },
    });

    eventBus.emit(AppEvent.OrderLocked, {
      orderId: order.id,
      userId: order.userId,
      mealId,
      finalPrice,
      aiDecision,
      decisionTrail,
    });
  }

  private async buildSpikeReason(mealId: string): Promise<string | null> {
    // Find the ingredient with highest recent price change
    const recipe = await prisma.recipe.findUnique({
      where: { mealId },
      include: { ingredients: { include: { ingredient: { include: { priceHistory: { orderBy: { recordedAt: 'desc' }, take: 2 } } } } } },
    });

    if (!recipe) return null;

    let maxSpikeIngredient = '';
    let maxSpikePct        = 0;

    for (const ri of recipe.ingredients) {
      const history = ri.ingredient.priceHistory;
      if (history.length < 2) continue;
      const pct = ((Number(history[0].pricePerUnit) - Number(history[1].pricePerUnit)) / Number(history[1].pricePerUnit)) * 100;
      if (pct > maxSpikePct) {
        maxSpikePct = pct;
        maxSpikeIngredient = ri.ingredient.name;
      }
    }

    return maxSpikeIngredient
      ? `${maxSpikeIngredient} ↑${Math.round(maxSpikePct)}%`
      : null;
  }
}

export const alertService = new AlertService();
