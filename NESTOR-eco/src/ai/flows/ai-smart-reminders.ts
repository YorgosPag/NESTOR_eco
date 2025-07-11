'use server'

/**
 * @fileOverview Generates smart reminders based on project deadlines using AI.
 *
 * - generateReminder - A function that generates smart reminders.
 * - GenerateReminderInput - The input type for the generateReminder function.
 * - GenerateReminderOutput - The return type for the generateReminder function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReminderInputSchema = z.object({
  projectName: z.string().describe('The name of the project.'),
  stageName: z.string().describe('The name of the stage.'),
  deadline: z.string().describe('The deadline for the stage (e.g., YYYY-MM-DD).'),
  status: z
    .enum(['pending', 'in progress', 'completed', 'failed'])
    .describe('The current status of the stage.'),
  lastUpdated: z
    .string()
    .describe('The date the stage was last updated (e.g., YYYY-MM-DD).'),
  notes: z.string().optional().describe('Any notes related to the stage.'),
});
export type GenerateReminderInput = z.infer<typeof GenerateReminderInputSchema>;

const GenerateReminderOutputSchema = z.object({
  reminder: z.string().describe('A friendly, concise reminder message in Greek, under 50 words.'),
  suggestedNextSteps: z.array(z.string()).describe('A list of 2-3 concrete, actionable next steps in Greek.'),
  riskAssessment: z.string().describe('A brief analysis of the risk associated with this stage in Greek.'),
  urgencyLevel: z.enum(['low', 'medium', 'high']).describe("The urgency level based on the deadline and status."),
});
export type GenerateReminderOutput = z.infer<typeof GenerateReminderOutputSchema>;

export async function generateReminder(input: GenerateReminderInput): Promise<GenerateReminderOutput> {
  return generateReminderFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReminderPrompt',
  input: {schema: GenerateReminderInputSchema},
  output: {schema: GenerateReminderOutputSchema},
  prompt: `You are an AI assistant for a project management app. Your task is to generate a detailed, structured reminder for a project stage.
  You MUST respond in Greek.

  Analyze the following stage information:
  - Project Name: {{{projectName}}}
  - Stage Name: {{{stageName}}}
  - Deadline: {{{deadline}}}
  - Status: {{{status}}}
  - Last Updated: {{{lastUpdated}}}
  - Notes: {{{notes}}}

  Based on this, perform the following actions:
  1.  **Generate a Reminder:** Create a friendly, concise reminder message (under 50 words) that summarizes the situation.
  2.  **Assess Urgency:** Determine the urgency level ('low', 'medium', 'high') based on how close the deadline is and the current status. A stage that is past its deadline is always 'high' urgency.
  3.  **Assess Risk:** Provide a brief risk assessment. For example, if a stage is approaching its deadline but hasn't been updated recently, mention the risk of delay.
  4.  **Suggest Next Steps:** List 2-3 concrete, actionable next steps for the user (e.g., "Επικοινωνήστε με τον ανάδοχο", "Ζητήστε ενημέρωση προόδου", "Ελέγξτε τα συνημμένα έγγραφα").

  Your final output must be a JSON object conforming to the output schema.
  `,
});

const generateReminderFlow = ai.defineFlow(
  {
    name: 'generateReminderFlow',
    inputSchema: GenerateReminderInputSchema,
    outputSchema: GenerateReminderOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
