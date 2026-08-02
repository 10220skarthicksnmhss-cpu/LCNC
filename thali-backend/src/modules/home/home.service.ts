// src/modules/home/home.service.ts
import { prisma } from '../../config/db';
import { AlertStatus, OrderStatus, SubStatus } from '@prisma/client';
import { recommendationService } from '../recommendations/recommendation.service';

export class HomeService {
  async getDashboard(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const [
      todayOrders,
      activeAlert,
      activeSubs,
      monthStats,
      recommendations,
    ] = await Promise.all([
      // Today's deliveries
      prisma.order.findMany({
        where: { userId, deliveryDate: { gte: today, lt: tomorrow } },
        include: { meal: { select: { name: true, colorHex: true, currentPrice: true } } },
        orderBy: { deliveryTime: 'asc' },
      }),

      // Pending alert
      prisma.priceAlert.findFirst({
        where: {
          subscription: { userId },
          status: AlertStatus.PENDING,
          respondDeadline: { gte: new Date() },
        },
        include: {
          meal: { select: { name: true } },
          aiSuggestions: { include: { meal: true }, orderBy: { rank: 'asc' }, take: 3 },
        },
        orderBy: { createdAt: 'desc' },
      }),

      // Active subscriptions count
      prisma.subscription.count({ where: { userId, status: SubStatus.ACTIVE } }),

      // Monthly stats
      (async () => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        const orders = await prisma.order.findMany({
          where: { userId, deliveryDate: { gte: monthStart }, status: OrderStatus.DELIVERED },
        });
        return {
          totalSpent:      Math.round(orders.reduce((s, o) => s + Number(o.finalPrice), 0)),
          savedViaAiSwaps: Math.max(0, Math.round(orders.filter(o => o.aiDecision).reduce((s, o) => s + (Number(o.basePrice) - Number(o.finalPrice)), 0))),
          aiMeals:         orders.filter(o => o.aiDecision).length,
          totalOrders:     orders.length,
        };
      })(),

      // Personalised meal recommendations
      recommendationService.getPersonalisedMeals(userId, 6),
    ]);

    return {
      greeting: this.getGreeting(),
      todayOrders: todayOrders.map(o => ({
        id:           o.id,
        meal:         o.meal.name,
        deliveryTime: this.formatTime(o.deliveryTime),
        status:       o.status.toLowerCase(),
        price:        Number(o.finalPrice),
        color:        o.meal.colorHex ?? '#888888',
      })),
      activeAlert: activeAlert ? {
        id:          activeAlert.id,
        meal:        activeAlert.meal.name,
        oldPrice:    Number(activeAlert.oldPrice),
        newPrice:    Number(activeAlert.newPrice),
        spikePct:    Math.round(Number(activeAlert.spikePct)),
        reason:      activeAlert.spikeReason ?? '',
        deadline:    activeAlert.respondDeadline.toISOString(),
        suggestions: activeAlert.aiSuggestions.map(s => ({
          rank:       s.rank,
          mealId:     s.mealId,
          mealName:   s.meal.name,
          price:      Number(s.meal.currentPrice),
          matchScore: s.matchScore,
          reasons:    s.reasonJson ?? {},
        })),
      } : null,
      stats: {
        activeSubs,
        ...monthStats,
      },
      recommendations,
    };
  }

  private getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  }

  private formatTime(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  }
}

export const homeService = new HomeService();
