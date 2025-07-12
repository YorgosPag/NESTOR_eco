'use server';

/**
 * @fileOverview An AI-powered flow to process uploaded documents and messages.
 * 
 * - processMessage - A function that handles document analysis.
 * - ProcessMessageInput - The input type for the processMessage function.
 * - ProcessMessageOutput - The return type for the processMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import {
  ProcessMessageInputSchema,
  ProcessMessageOutputSchema,
  type ProcessMessageInput,
  type ProcessMessageOutput
} from './schemas';

export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
  return processMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMessagePrompt',
  input: { schema: ProcessMessageInputSchema },
  output: { schema: ProcessMessageOutputSchema },
  prompt: `You are an intelligent assistant for a project management application.
  Your task is to analyze an uploaded file and an optional accompanying message.
  You MUST respond in Greek.

  Analyze the following information:
  - Document: {{media url=fileInfo.dataUri}}
  - User Message: {{{messageText}}}
  
  Based on your analysis, perform the following actions:
  1.  **Summarize:** Provide a brief, friendly summary of the document's content and purpose.
  2.  **Suggest Tags:** Generate 3-5 relevant tags (e.g., "Τιμολόγιο", "Τεχνική Μελέτη", "Κουφώματα").
  3.  **Recommend Forwarding:** Suggest which person or project stage the document should be forwarded to (e.g., "Προώθηση στον λογιστή", "Επισύναψη στο στάδιο 'Παραγγελία Υλικών'").

  Your final output must be a JSON object conforming to the output schema.
  `,
});

const processMessageFlow = ai.defineFlow(
  {
    name: 'processMessageFlow',
    inputSchema: ProcessMessageInputSchema,
    outputSchema: ProcessMessageOutputSchema,
  },
  async (input) => {
    // If there's no file, we can't do much.
    if (!input.fileInfo) {
      return {
        responseText: 'Δεν μεταφορτώθηκε αρχείο για ανάλυση.',
      };
    }
    
    const { output } = await prompt(input);
    return output!;
  }
);
