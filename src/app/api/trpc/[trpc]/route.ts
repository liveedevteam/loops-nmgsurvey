/**
 * tRPC API Route Handler
 * 
 * This file creates the Next.js API route that handles
 * all tRPC requests. Uses the App Router catch-all route pattern.
 */

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter } from '@/server/routers';
import { createContext } from '@/server/trpc';

/**
 * Handle tRPC requests via fetch adapter
 * Works with both GET (queries) and POST (mutations) requests
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
    
    // Error handling for production
    onError:
      process.env.NODE_ENV === 'development'
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };

