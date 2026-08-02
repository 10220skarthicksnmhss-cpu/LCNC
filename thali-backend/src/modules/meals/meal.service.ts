// src/modules/meals/meal.service.ts
import { mealRepository, type MealFilters } from './meal.repository';
import { AppError } from '../../shared/errors/AppError';
import { DietaryType } from '@prisma/client';

const filterMap: Record<string, Partial<MealFilters>> = {
  'All':          {},
  'Veg':          { type: DietaryType.VEG },
  'Non-veg':      { type: DietaryType.NON_VEG },
  'Vegan':        { type: DietaryType.VEGAN },
  'Under ₹150':   { maxPrice: 150 },
  'South Indian': { cuisine: 'South Indian' },
};

export class MealService {
  async listMeals(query: {
    search?: string;
    filter?: string;
    type?: string;
    maxPrice?: number;
    cuisine?: string;
    page?: number;
    limit?: number;
  }) {
    const preset = query.filter ? filterMap[query.filter] ?? {} : {};

    const filters: MealFilters = {
      search:   query.search,
      maxPrice: preset.maxPrice ?? query.maxPrice,
      cuisine:  preset.cuisine  ?? query.cuisine,
      type:     (preset.type ?? (query.type ? DietaryType[query.type.toUpperCase() as keyof typeof DietaryType] : undefined)),
      page:     query.page  ?? 1,
      limit:    query.limit ?? 20,
    };

    const { data, total } = await mealRepository.findMany(filters);

    return {
      data: data.map(this.formatMeal),
      pagination: {
        page: filters.page!, limit: filters.limit!,
        total, totalPages: Math.ceil(total / filters.limit!),
      },
    };
  }

  async getMealDetail(mealId: string) {
    const meal = await mealRepository.findById(mealId);
    if (!meal) throw AppError.notFound('Meal');

    const ingredients = meal.recipe?.ingredients.map(ri => ({
      name: ri.ingredient.name,
      pct:  Number(ri.pctOfCost ?? 0),
      qty:  Number(ri.quantity),
      unit: ri.unit,
    })) ?? [];

    return {
      ...this.formatMeal(meal),
      restaurant: meal.restaurant,
      ingredients,
      nutritionalInfo: meal.nutritionalInfo ? {
        calories:  meal.nutritionalInfo.calories,
        proteinG:  Number(meal.nutritionalInfo.proteinG),
        carbsG:    Number(meal.nutritionalInfo.carbsG),
        fatG:      Number(meal.nutritionalInfo.fatG),
        fiberG:    Number(meal.nutritionalInfo.fiberG),
      } : null,
    };
  }

  private formatMeal(meal: any) {
    return {
      id:             meal.id,
      name:           meal.name,
      cuisine:        meal.cuisine,
      tag:            meal.cuisineTag,
      type:           meal.dietaryType.toLowerCase().replace('_', '-'),
      price:          Number(meal.currentPrice),
      oldPrice:       Number(meal.basePrice),
      deliveryTime:   `${meal.deliveryTimeMin} min`,
      color:          meal.colorHex ?? '#888888',
      isAvailable:    meal.isAvailable,
    };
  }
}

export const mealService = new MealService();
