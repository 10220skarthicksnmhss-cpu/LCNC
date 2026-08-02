// src/modules/auth/auth.routes.ts
import type { FastifyInstance } from 'fastify';
import { authController } from './auth.controller';

export async function authRoutes(fastify: FastifyInstance) {
  const c = authController;

  // POST /auth/register
  fastify.post('/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user with onboarding preferences',
      body: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name:        { type: 'string' },
          email:       { type: 'string', format: 'email' },
          phone:       { type: 'string' },
          password:    { type: 'string' },
          preferences: { type: 'object' },
        },
      },
    },
    handler: c.register.bind(c),
  });

  // POST /auth/login
  fastify.post('/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email:    { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: c.login.bind(c),
  });

  // POST /auth/refresh
  fastify.post('/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Rotate refresh token and issue new access token',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
    },
    handler: c.refresh.bind(c),
  });

  // POST /auth/logout
  fastify.post('/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Revoke refresh token and log out',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
    },
    handler: c.logout.bind(c),
  });
}
