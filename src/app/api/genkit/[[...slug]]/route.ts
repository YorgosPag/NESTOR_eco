{// src/app/api/genkit/[[...slug]]/route.ts
import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase/plugin';
import { logger, startFlowsServer } from '@genkit-ai/next/plugin';

// Dynamically import flows to register them with Genkit
import '@/ai/flows/ai-smart-reminders';
import '@/ai/flows/message-processor';
import '@/ai/flows/reporting-flow';
// Note: Schemas are implicitly loaded by the flows that use them.

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const plugins: Plugin<any>[] = [firebase(), logger()];

if (geminiApiKey) {
  plugins.push(googleAI({ apiKey: geminiApiKey }));
} else {
  const message = 'GEMINI_API_KEY is not set. Some AI features may be disabled.';
  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  } else {
    console.error(message);
  }
}

// This is the correct place to configure Genkit with plugins for the API server.
genkit({
  plugins,
  enableTracing: true,
  traceStore: 'firebase',
});

// Start the flows server to handle API requests.
export const { GET, POST } = startFlowsServer();
