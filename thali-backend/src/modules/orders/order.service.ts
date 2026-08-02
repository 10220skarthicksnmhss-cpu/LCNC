// src/modules/orders/order.service.ts
import { prisma } from '../../config/db';
import { OrderStatus, SubStatus } from '@prisma/client';
import { AppError } from '../../shared/errors/AppError';

export class OrderService {
  /** Pre-create pending orders for all active subscriptions for tomorrow */
  async createDailyOrders(): Promise<number> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDay() || 7;
    tomorrow.setHours(0, 0, 0, 0);

    const activeSubs = await prisma.subscription.findMany({
      where: { status: SubStatus.ACTIVE, deliveryDays: { has: tomorrowDay } },
      include: {
        meal: { select: { id: true, currentPrice: true } },
        user: { select: { id: true } },
      },
    });

    let created = 0;
    for (const sub of activeSubs) {
      // Don't create duplicate
      const exists = await prisma.order.findFirst({
        where: { subscriptionId: sub.id, deliveryDate: tomorrow },
      });
      if (exists) continue;

      const price = Number(sub.meal.currentPrice);
      const order = await prisma.order.create({
        data: {
          userId:           sub.userId,
          subscriptionId:   sub.id,
          mealId:           sub.mealId,
          deliveryDate:     tomorrow,
          deliveryTime:     sub.deliveryTime,
          deliveryAddressId: sub.addressId,
          status:           OrderStatus.PENDING,
          basePrice:        price,
          finalPrice:       price,
          decisionTrail:    'Original order pending.',
        },
      });

      await prisma.orderStatusHistory.create({
        data: { orderId: order.id, status: OrderStatus.PENDING },
      });

      created++;
    }

    return created;
  }

  /** Get paginated order history for a user */
  async getHistory(userId: string, query: { period?: string; from?: string; to?: string; page?: number; limit?: number }) {
    const { period = 'month', from, to, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    let dateFrom: Date;
    let dateTo: Date = new Date();

    if (from && to) {
      dateFrom = new Date(from);
      dateTo   = new Date(to);
    } else {
      dateFrom = new Date();
      if (period === 'week')  dateFrom.setDate(dateFrom.getDate() - 7);
      if (period === 'month') dateFrom.setDate(dateFrom.getDate() - 30);
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId, deliveryDate: { gte: dateFrom, lte: dateTo } },
        include: { meal: { select: { name: true } } },
        orderBy: { deliveryDate: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: { userId, deliveryDate: { gte: dateFrom, lte: dateTo } } }),
    ]);

    // Monthly summary stats
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthOrders = await prisma.order.findMany({
      where: { userId, deliveryDate: { gte: monthStart }, status: OrderStatus.DELIVERED },
    });

    const totalSpent        = monthOrders.reduce((s, o) => s + Number(o.finalPrice), 0);
    const aiOrders          = monthOrders.filter(o => o.aiDecision);
    const savedViaAiSwaps   = aiOrders.reduce((s, o) => s + (Number(o.basePrice) - Number(o.finalPrice)), 0);

    return {
      data: orders.map(o => ({
        id:            o.id,
        date:          o.deliveryDate.toISOString().split('T')[0],
        meal:          o.meal.name,
        finalPrice:    Number(o.finalPrice),
        aiDecision:    o.aiDecision,
        decisionTrail: o.decisionTrail ?? '',
        status:        o.status.toLowerCase(),
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      summary: {
        totalSpent:       Math.round(totalSpent),
        savedViaAiSwaps:  Math.max(0, Math.round(savedViaAiSwaps)),
        aiSelectedMeals:  aiOrders.length,
        totalOrders:      monthOrders.length,
      },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId },
      include: {
        meal: { select: { name: true, cuisine: true } },
        statusHistory: { orderBy: { changedAt: 'asc' } },
      },
    });
    if (!order) throw AppError.notFound('Order');
    return order;
  }
}

export const orderService = new OrderService();
