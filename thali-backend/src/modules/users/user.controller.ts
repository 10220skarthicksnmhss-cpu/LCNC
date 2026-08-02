// src/modules/users/user.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { userService } from './user.service';
import { PatchMeSchema } from './user.schema';
import { ok } from '../../shared/types/api-response';

export class UserController {
  async getMe(request: FastifyRequest, reply: FastifyReply) {
    const user = await userService.getMe(request.userId);
    return reply.send(ok(user));
  }

  async patchMe(request: FastifyRequest, reply: FastifyReply) {
    const dto = PatchMeSchema.parse(request.body);
    const user = await userService.patchMe(request.userId, dto);
    return reply.send(ok(user, 'Profile updated'));
  }
}

export const userController = new UserController();
