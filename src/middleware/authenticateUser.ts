import type { Context, Next } from 'hono';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import AppError from '@/utils/AppError';
import { db } from '@/db';
import { users } from '../db/schema';
import pinoLogger from '@/utils/logger';

export const authenticateUser = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    throw new AppError('Authentication required', 401);
  }

  // Extract the base64 encoded string after "Basic "
  const encodedCreds = authHeader.split(' ')[1];

  if (!encodedCreds) {
    throw new AppError('Invalid Authorization header', 401);
  }

  const [emailAddress, password] = Buffer.from(encodedCreds, 'base64')
    .toString('utf8')
    .split(':');

  if (!emailAddress || !password) {
    throw new AppError('Email and password are required', 401);
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.emailAddress, emailAddress),
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    c.set('currentUser', user);

    await next();
  } catch (error) {
    // Catch any AppErrors thrown within this try block, or re-throw other errors
    if (error instanceof AppError) {
      throw error; // Re-throw custom errors directly to global error handler
    }

    pinoLogger.error('Basic Auth error:', error);

    // For unexpected errors during DB query or bcrypt, respond with generic unauthorized
    throw new AppError(
      'Authentication failed: An internal error occurred during authentication',
      401,
    );
  }
};
