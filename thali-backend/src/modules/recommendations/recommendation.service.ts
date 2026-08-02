// src/modules/recommendations/recommendation.service.ts
import { prisma } from '../../config/db';
import { calculateMatchScore } from './match-score.calculator';
import { DietaryType } from '@prisma/client';

export class RecommendationService {
  /**
   * Generates ranked meal alternatives for a price alert.
   * Persists top 3 results in ai_suggestions table.
   */
  async generateSuggestions(alertId: string): Promise<void> {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
      include: {
        meal: { include: { nutritionalInfo: true } },
        subscription: { include: { user: { include: { preferences: true } } } },
      },
    });

    if (!alert || !alert.subscription.user.preferences) return;

    const prefs = alert.subscription.user.preferences;
    const userId = alert.subscription.userId;
    const alertBudget = prefs.dailyBudget;
    const originalMeal = alert.meal;

    // Get user's last 90 days of orders (for history scoring)
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const orderHistory = await prisma.order.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { mealId: true },
    });

    // Get all available meals (excluding the original)
    const candidates = await prisma.meal.findMany({
      where: { isAvailable: true, id: { not: originalMeal.id } },
      include: { nutritionalInfo: true },
    });

    // Filter out meals that violate hard dietary constraint
    const eligible = candidates.filter(m => {
      if (prefs.dietaryType === DietaryType.VEGAN)   return m.dietaryType === DietaryType.VEGAN;
      if (prefs.dietaryType === DietaryType.VEG)     return m.dietaryType !== DietaryType.NON_VEG;
      return true; // NON_VEG users see everything
    });

    // Score and rank
    const scored = eligible
      .map(m => calculateMatchScore({ candidate: m, originalMeal, userPreferences: prefs, orderHistory, alertBudget }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // Persist suggestions (delete old ones first)
    await prisma.aiSuggestion.deleteMany({ where: { alertId } });
    await prisma.aiSuggestion.createMany({
      data: scored.map((s, i) => ({
        alertId,
        mealId:     s.mealId,
        rank:       i + 1,
        matchScore: s.matchScore,
        reasonJson: s.reasons as unknown as Record<string, boolean>,
      })),
    });
  }

  /** Get top-N meal suggestions personalised for a user (used on Home screen) */
  async getPersonalisedMeals(userId: string, limit = 6): Promise<any[]> {
    const prefs = await prisma.userPreferences.findUnique({ where: { userId } });
    if (!prefs) {
      const meals = await prisma.meal.findMany({ where: { isAvailable: true }, take: limit });
      return meals;
    }

    const since = new Date();
    since.setDate(since.getDate() - 90);
    const orderHistory = await prisma.order.findMany({
      where: { userId, createdAt: { gte: since } },
      select: { mealId: true },
    });

    const allMeals = await prisma.meal.findMany({
      where: { isAvailable: true },
      include: { nutritionalInfo: true },
    });

    // Create a dummy "original meal" based on prefs for scoring purposes
    const dummyOriginal = allMeals[0];

    const scored = allMeals
      .map(m => ({
        meal: m,
        ...calculateMatchScore({
          candidate: m, originalMeal: dummyOriginal,
          userPreferences: prefs, orderHistory,
          alertBudget: prefs.dailyBudget,
        }),
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    return scored.map(s => ({
      ...s.meal,
      matchScore: s.matchScore,
      price: Number(s.meal.currentPrice),
      oldPrice: Number(s.meal.basePrice),
      type: s.meal.dietaryType.toLowerCase().replace('_', '-'),
      deliveryTime: `${s.meal.deliveryTimeMin} min`,
      color: s.meal.colorHex ?? '#888888',
    }));
  }
}

export const recommendationService = new RecommendationService();
