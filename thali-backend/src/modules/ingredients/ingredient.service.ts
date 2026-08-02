// src/modules/ingredients/ingredient.service.ts
import { prisma } from '../../config/db';
import { AppError } from '../../shared/errors/AppError';
import { mealPriceCalculator } from '../meals/meal.price-calculator';
import { eventBus, AppEvent } from '../../events/event-bus';

export class IngredientService {
  /** Bulk update ingredient prices (called by scheduler or internal API) */
  async bulkUpdatePrices(updates: { ingredientId: string; pricePerUnit: number; source?: string }[]) {
    let mealsRecalculated = 0;
    let alertsTriggered   = 0;

    for (const update of updates) {
      const ingredient = await prisma.ingredient.findUnique({ where: { id: update.ingredientId } });
      if (!ingredient) continue;

      const oldPrice = Number(ingredient.currentPrice);

      // Update current price + record history
      await prisma.$transaction([
        prisma.ingredient.update({
          where: { id: update.ingredientId },
          data: { currentPrice: update.pricePerUnit, lastUpdatedAt: new Date() },
        }),
        prisma.ingredientPriceHistory.create({
          data: {
            ingredientId: update.ingredientId,
            pricePerUnit: update.pricePerUnit,
            source: update.source ?? 'api',
          },
        }),
      ]);

      // Emit event
      eventBus.emit(AppEvent.IngredientPriceUpdated, {
        ingredientId: update.ingredientId,
        ingredientName: ingredient.name,
        oldPrice,
        newPrice: update.pricePerUnit,
        spikePct: oldPrice > 0 ? ((update.pricePerUnit - oldPrice) / oldPrice) * 100 : 0,
      });

      // Recalculate all meals using this ingredient
      const mealIds = await prisma.recipeIngredient.findMany({
        where: { ingredientId: update.ingredientId },
        select: { recipe: { select: { mealId: true } } },
      });

      for (const r of mealIds) {
        const result = await mealPriceCalculator.recalculate(r.recipe.mealId);
        if (result) mealsRecalculated++;
      }
    }

    return { updated: updates.length, mealsRecalculated };
  }

  async listIngredients() {
    return prisma.ingredient.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, unit: true, currentPrice: true, lastUpdatedAt: true },
    });
  }

  async getPriceHistory(ingredientId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.ingredientPriceHistory.findMany({
      where: { ingredientId, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select: { pricePerUnit: true, recordedAt: true, source: true },
    });
  }
}

export const ingredientService = new IngredientService();
