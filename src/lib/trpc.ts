/**
 * tRPC Client Configuration
 * 
 * Sets up the tRPC React hooks for use in client components.
 * Provides type-safe API calls with React Query integration.
 */

'use client';

import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/routers';

/**
 * Create type-safe tRPC React hooks
 * Usage: trpc.survey.submit.useMutation(), trpc.survey.getStatus.useQuery()
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Get the base URL for API calls
 * Handles both server-side and client-side rendering
 */
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Browser: use relative path
    return '';
  }
  
  // SSR: use localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

/**
 * Create tRPC client with configuration
 */
export function createTRPCClient() {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${getBaseUrl()}/api/trpc`,
        transformer: superjson,
      }),
    ],
  });
}

export default trpc;

