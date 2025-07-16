// src/app/api/genkit/[[...slug]]/route.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { firebase } from '@genkit-ai/firebase';
import { devLogger, startFlowsServer } from '@genkit-ai/flow';

// Dynamically import flows
import '@/ai/flows/ai-smart-reminders';
import '@/ai/flows/message-processor';
import '@/ai/flows/reporting-flow';
// Note: Schemas are implicitly loaded by the flows that use them.

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const plugins = [firebase(), devLogger()];

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

genkit({
  plugins,
  enableTracing: true,
  traceStore: 'firebase',
});

export const { GET, POST } = startFlowsServer();
