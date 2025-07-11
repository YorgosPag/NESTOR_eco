'use server';

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const plugins = [];

if (geminiApiKey) {
  plugins.push(googleAI({apiKey: geminiApiKey}));
} else {
  const message =
    '[WARNING] The GEMINI_API_KEY environment variable is not set. Genkit AI features will be disabled. Please add the key to your environment configuration.';
  // Log a warning in development, or an error in production
  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  } else {
    console.error(message);
  }
}

export const ai = genkit({
  plugins: plugins,
});
