/**
 * tRPC Server Configuration
 * 
 * This file initializes the tRPC server with context and
 * provides the building blocks for creating type-safe APIs.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

// ============================================
// Context Definition
// ============================================

/**
 * Context available to all tRPC procedures
 * Can be extended to include authenticated user, database connections, etc.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Context {
  // Add context properties here as needed
  // e.g., user?: { id: string; email: string; }
}

/**
 * Creates the context for each tRPC request
 * This function is called for every incoming request
 */
export function createContext(): Context {
  return {
    // Add context values here
  };
}

// ============================================
// tRPC Initialization
// ============================================

/**
 * Initialize tRPC with custom configuration
 * - superjson transformer for Date/Map/Set serialization
 * - Custom error formatting for Zod validation errors
 */
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Include Zod errors in a structured format
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ============================================
// Reusable Building Blocks
// ============================================

/**
 * Router factory - used to create new routers
 */
export const router = t.router;

/**
 * Middleware factory - for creating reusable middleware
 */
export const middleware = t.middleware;

/**
 * Public procedure - accessible without authentication
 * Use this for endpoints that don't require LINE user verification
 */
export const publicProcedure = t.procedure;

/**
 * Merge routers - combine multiple routers into one
 */
export const mergeRouters = t.mergeRouters;

// ============================================
// Custom Middleware Examples
// ============================================

/**
 * Logging middleware - logs procedure calls
 */
const loggerMiddleware = middleware(async (opts) => {
  const start = Date.now();
  
  const result = await opts.next();
  
  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };
  
  if (result.ok) {
    console.log('✅ tRPC OK:', meta);
  } else {
    console.error('❌ tRPC Error:', meta);
  }
  
  return result;
});

/**
 * Logged procedure - public procedure with logging
 */
export const loggedProcedure = publicProcedure.use(loggerMiddleware);

// ============================================
// Error Helpers
// ============================================

/**
 * Create a standardized tRPC error
 */
export function createError(
  code: TRPCError['code'],
  message: string
): TRPCError {
  return new TRPCError({ code, message });
}

export default t;

