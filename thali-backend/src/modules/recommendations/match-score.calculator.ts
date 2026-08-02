// src/modules/recommendations/match-score.calculator.ts
// Rule-based match score calculator — no external AI service required

import type { Meal, UserPreferences, Order } from '@prisma/client';

interface MatchInput {
  candidate:       Meal & { nutritionalInfo?: any };
  originalMeal:    Meal & { nutritionalInfo?: any };
  userPreferences: UserPreferences;
  orderHistory:    { mealId: string }[];
  alertBudget:     number;
}

interface MatchReasons {
  withinBudget:   boolean;
  matchesCuisine: boolean;
  available:      boolean;
  matchesDietary: boolean;
}

export interface MatchResult {
  mealId:     string;
  matchScore: number;
  reasons:    MatchReasons;
}

/**
 * Weighted rule-based match scoring (no external AI dependency):
 *
 * Weights:
 *  - Cuisine match         30%
 *  - Budget fit            25%
 *  - Dietary match         20%
 *  - Nutritional similarity 15%
 *  - Order history         10%
 */
export function calculateMatchScore(input: MatchInput): MatchResult {
  const { candidate, originalMeal, userPreferences, orderHistory, alertBudget } = input;

  const W = { cuisine: 0.30, budget: 0.25, dietary: 0.20, nutrition: 0.15, history: 0.10 };

  // 1. Cuisine match
  const cuisineScore = userPreferences.cuisines.includes(candidate.cuisineTag ?? candidate.cuisine) ? 100 : 40;

  // 2. Budget score — 100 if within budget, degrades proportionally above
  const price = Number(candidate.currentPrice);
  const budgetScore = price <= alertBudget
    ? 100
    : Math.max(0, 100 - Math.round(((price - alertBudget) / alertBudget) * 100));

  // 3. Dietary match
  const dietaryScore = candidate.dietaryType === userPreferences.dietaryType ? 100 : 0;

  // 4. Nutritional similarity (cosine-style similarity on macro vector)
  const nutritionScore = computeNutritionalSimilarity(originalMeal.nutritionalInfo, candidate.nutritionalInfo);

  // 5. Order history — has user ordered this before?
  const orderedBefore = orderHistory.some(o => o.mealId === candidate.id);
  const historyScore  = orderedBefore ? 90 : 50;

  const raw = (
    cuisineScore  * W.cuisine  +
    budgetScore   * W.budget   +
    dietaryScore  * W.dietary  +
    nutritionScore * W.nutrition +
    historyScore  * W.history
  );

  const matchScore = Math.min(100, Math.round(raw));

  return {
    mealId: candidate.id,
    matchScore,
    reasons: {
      withinBudget:   price <= alertBudget,
      matchesCuisine: userPreferences.cuisines.includes(candidate.cuisineTag ?? ''),
      available:      candidate.isAvailable,
      matchesDietary: candidate.dietaryType === userPreferences.dietaryType,
    },
  };
}

function computeNutritionalSimilarity(a?: any, b?: any): number {
  if (!a || !b) return 50; // neutral score if no data

  const vecA = [Number(a.calories ?? 0), Number(a.proteinG ?? 0), Number(a.carbsG ?? 0), Number(a.fatG ?? 0)];
  const vecB = [Number(b.calories ?? 0), Number(b.proteinG ?? 0), Number(b.carbsG ?? 0), Number(b.fatG ?? 0)];

  const dot   = vecA.reduce((s, v, i) => s + v * vecB[i], 0);
  const magA  = Math.sqrt(vecA.reduce((s, v) => s + v * v, 0));
  const magB  = Math.sqrt(vecB.reduce((s, v) => s + v * v, 0));

  if (magA === 0 || magB === 0) return 50;
  const cosine = dot / (magA * magB);
  return Math.round(cosine * 100);
}
