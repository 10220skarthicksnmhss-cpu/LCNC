// src/modules/meals/meal.repository.ts
import { prisma } from '../../config/db';
import type { DietaryType } from '@prisma/client';

export interface MealFilters {
  search?:   string;
  type?:     DietaryType;
  maxPrice?: number;
  cuisine?:  string;
  page?:     number;
  limit?:    number;
}

const mealSelect = {
  id: true, name: true, cuisine: true, cuisineTag: true, dietaryType: true,
  colorHex: true, deliveryTimeMin: true, basePrice: true, currentPrice: true,
  isAvailable: true,
  restaurant: { select: { id: true, name: true } },
};

export const mealRepository = {
  async findMany(filters: MealFilters) {
    const { search, type, maxPrice, cuisine, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where = {
      isAvailable: true,
      ...(search && {
        OR: [
          { name:    { contains: search, mode: 'insensitive' as const } },
          { cuisine: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(type      && { dietaryType: type }),
      ...(maxPrice  && { currentPrice: { lte: maxPrice } }),
      ...(cuisine   && { cuisineTag: { equals: cuisine, mode: 'insensitive' as const } }),
    };

    const [data, total] = await Promise.all([
      prisma.meal.findMany({ where, select: mealSelect, skip, take: limit, orderBy: { name: 'asc' } }),
      prisma.meal.count({ where }),
    ]);

    return { data, total };
  },

  async findById(id: string) {
    return prisma.meal.findUnique({
      where: { id },
      include: {
        restaurant: { select: { id: true, name: true, opensAt: true, closesAt: true } },
        nutritionalInfo: true,
        recipe: {
          include: {
            ingredients: {
              include: { ingredient: { select: { name: true, unit: true, currentPrice: true } } },
            },
          },
        },
      },
    });
  },

  async findByIds(ids: string[]) {
    return prisma.meal.findMany({ where: { id: { in: ids }, isAvailable: true }, select: mealSelect });
  },

  async updatePrice(mealId: string, newPrice: number) {
    return prisma.$transaction([
      prisma.meal.update({ where: { id: mealId }, data: { currentPrice: newPrice } }),
      prisma.mealPriceHistory.create({ data: { mealId, price: newPrice } }),
    ]);
  },

  async getYesterdayPrice(mealId: string): Promise<number | null> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await prisma.mealPriceHistory.findFirst({
      where: { mealId, recordedAt: { gte: yesterday, lt: today } },
      orderBy: { recordedAt: 'desc' },
    });
    return record ? Number(record.price) : null;
  },

  async findMealsUsingIngredient(ingredientId: string) {
    const recipes = await prisma.recipeIngredient.findMany({
      where: { ingredientId },
      select: { recipe: { select: { mealId: true } } },
    });
    return [...new Set(recipes.map(r => r.recipe.mealId))];
  },

  async getRecipeWithPrices(mealId: string) {
    return prisma.recipe.findUnique({
      where: { mealId },
      include: {
        ingredients: {
          include: {
            ingredient: { select: { id: true, name: true, currentPrice: true, unit: true } },
          },
        },
        meal: { select: { restaurant: { select: { marginPct: true } } } },
      },
    });
  },
};
