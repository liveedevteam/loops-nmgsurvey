/**
 * Root tRPC Router
 * 
 * Combines all sub-routers into a single app router.
 * This is the main router that gets exposed to the client.
 */

import { router } from '../trpc';
import { surveyRouter } from './survey';

/**
 * Main application router
 * All sub-routers are nested under their respective keys
 */
export const appRouter = router({
  survey: surveyRouter,
});

/**
 * Export type definition of API
 * This is used by the client to infer types
 */
export type AppRouter = typeof appRouter;

