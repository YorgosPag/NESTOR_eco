import {genkit} from 'genkit';

/**
 * This is the base Genkit configuration object.
 * The actual plugins and flows are configured and initialized
 * within the Genkit API route handler at `src/app/api/genkit/[[...slug]]/route.ts`
 * to prevent server-only code from being bundled with client components.
 */
export const ai = genkit({
  // Plugins are configured in the API route.
});
