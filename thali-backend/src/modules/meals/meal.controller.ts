// src/modules/meals/meal.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { mealService } from './meal.service';
import { ok, paginated } from '../../shared/types/api-response';

export class MealController {
  async list(request: FastifyRequest<{ Querystring: {
    search?: string; filter?: string; type?: string;
    maxPrice?: number; cuisine?: string; page?: number; limit?: number;
  }}>, reply: FastifyReply) {
    const result = await mealService.listMeals(request.query);
    return reply.send(result);
  }

  async detail(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const meal = await mealService.getMealDetail(request.params.id);
    return reply.send(ok(meal));
  }
}

export const mealController = new MealController();
