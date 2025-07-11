import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

const plugins = [];

if (geminiApiKey) {
  plugins.push(googleAI({apiKey: geminiApiKey}));
} else {
  const message = 'GEMINI_API_KEY is not set. AI features will be disabled.';
  if (process.env.NODE_ENV === 'development') {
    console.warn(message);
  } else {
    // In a production environment, this might be a critical error.
    console.error(message);
  }
}

export const ai = genkit({
  plugins: plugins,
});
