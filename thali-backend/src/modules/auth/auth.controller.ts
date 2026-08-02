// src/modules/auth/auth.controller.ts
import type { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from './auth.service';
import {
  RegisterSchema, LoginSchema, RefreshSchema, LogoutSchema,
  type RegisterDto, type LoginDto, type RefreshDto, type LogoutDto,
} from './auth.schema';
import { ok } from '../../shared/types/api-response';

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply) {
    const dto = RegisterSchema.parse(request.body);
    const result = await authService.register(dto);
    return reply.status(201).send(ok(result, 'Account created successfully'));
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    const dto = LoginSchema.parse(request.body);
    const result = await authService.login(dto);
    return reply.send(ok(result, 'Login successful'));
  }

  async refresh(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = RefreshSchema.parse(request.body);
    const tokens = await authService.refresh(refreshToken);
    return reply.send(ok(tokens));
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const { refreshToken } = LogoutSchema.parse(request.body);
    await authService.logout(refreshToken);
    return reply.send(ok(null, 'Logged out successfully'));
  }
}

export const authController = new AuthController();
