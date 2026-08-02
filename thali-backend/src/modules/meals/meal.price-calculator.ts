// src/modules/meals/meal.price-calculator.ts
import { mealRepository } from './meal.repository';
import { computeMealPrice } from '../../shared/utils/price.utils';
import { eventBus, AppEvent } from '../../events/event-bus';

export class MealPriceCalculator {
  /**
   * Recalculates the price of a single meal from its recipe + current ingredient prices.
   * Emits MealPriceRecalculated if the price changed.
   */
  async recalculate(mealId: string): Promise<{ oldPrice: number; newPrice: number } | null> {
    const recipe = await mealRepository.getRecipeWithPrices(mealId);
    if (!recipe) return null;

    // Sum ingredient costs
    const ingredientCost = recipe.ingredients.reduce((sum, ri) => {
      const cost = Number(ri.ingredient.currentPrice) * Number(ri.quantity);
      return sum + cost;
    }, 0);

    const marginPct = Number(recipe.meal.restaurant.marginPct);
    const { totalPrice: newPrice } = computeMealPrice(ingredientCost, marginPct);

    // Get current price to check if it changed
    const meal = await mealRepository.findById(mealId);
    if (!meal) return null;

    const oldPrice = Number(meal.currentPrice);

    // Only update if price actually changed (more than 0.5 INR rounding threshold)
    if (Math.abs(newPrice - oldPrice) < 0.5) return null;

    await mealRepository.updatePrice(mealId, newPrice);

    // Emit event for downstream spike detection
    eventBus.emit(AppEvent.MealPriceRecalculated, { mealId, oldPrice, newPrice });

    return { oldPrice, newPrice };
  }

  /**
   * Recalculate all meals that use a given ingredient.
   */
  async recalculateForIngredient(ingredientId: string): Promise<void> {
    const mealIds = await mealRepository.findMealsUsingIngredient(ingredientId);
    for (const mealId of mealIds) {
      await this.recalculate(mealId);
    }
  }
}

export const mealPriceCalculator = new MealPriceCalculator();
