/**
 * tRPC Provider Component
 * 
 * Wraps the application with tRPC and React Query providers.
 * This enables type-safe API calls throughout the app.
 */

'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from '@/lib/trpc';

interface TRPCProviderProps {
  children: React.ReactNode;
}

/**
 * TRPCProvider wraps children with both React Query and tRPC contexts
 */
export function TRPCProvider({ children }: TRPCProviderProps) {
  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching for survey app
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
          },
        },
      })
  );
  
  const [trpcClient] = useState(() => createTRPCClient());

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default TRPCProvider;

