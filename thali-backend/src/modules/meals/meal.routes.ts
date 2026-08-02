// src/modules/meals/meal.routes.ts
import type { FastifyInstance } from 'fastify';
import { mealController } from './meal.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

export async function mealRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authMiddleware);

  fastify.get('/', {
    schema: {
      tags: ['Meals'],
      summary: 'List meals with optional search and filters',
      querystring: {
        type: 'object',
        properties: {
          search:   { type: 'string' },
          filter:   { type: 'string', enum: ['All','Veg','Non-veg','Vegan','Under ₹150','South Indian'] },
          type:     { type: 'string' },
          maxPrice: { type: 'number' },
          cuisine:  { type: 'string' },
          page:     { type: 'number', default: 1 },
          limit:    { type: 'number', default: 20 },
        },
      },
    },
    handler: mealController.list.bind(mealController),
  });

  fastify.get('/:id', {
    schema: {
      tags: ['Meals'],
      summary: 'Get full meal detail with ingredients and nutrition',
      params: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'] },
    },
    handler: mealController.detail.bind(mealController),
  });
}
