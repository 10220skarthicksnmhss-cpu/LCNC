// src/shared/errors/error-handler.ts
import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './AppError';
import { ZodError } from 'zod';

export function errorHandler(
  error: FastifyError | AppError | ZodError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void {
  request.log.error({ err: error, req: request.id }, 'Request error');

  // Zod validation error
  if (error instanceof ZodError) {
    reply.status(400).send({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      errors: error.flatten().fieldErrors,
    });
    return;
  }

  // Known application error
  if (error instanceof AppError) {
    reply.status(error.statusCode).send({
      success: false,
      code: error.code,
      message: error.message,
    });
    return;
  }

  // Fastify validation error (JSON schema)
  if ('statusCode' in error && error.statusCode === 400) {
    reply.status(400).send({
      success: false,
      code: 'VALIDATION_ERROR',
      message: error.message,
    });
    return;
  }

  // JWT errors from @fastify/jwt
  if (error.message?.includes('jwt') || error.message?.includes('token')) {
    reply.status(401).send({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
    return;
  }

  // Prisma errors
  if (error.message?.includes('Unique constraint')) {
    reply.status(409).send({
      success: false,
      code: 'CONFLICT',
      message: 'Resource already exists',
    });
    return;
  }

  // Unknown / unhandled
  reply.status(500).send({
    success: false,
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  });
}
