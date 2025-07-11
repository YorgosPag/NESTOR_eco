
'use server';

/**
 * @fileOverview This is the central AI processing flow for the application.
 * It handles incoming messages, with or without files, determines user intent,
 * uses tools to interact with project data, and generates comprehensive responses
 * including summaries, suggested tags, and forwarding recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { findContextByQuery, updateStageStatus, addFileToStage as addFileToStageData } from '@/app/actions/projects';
import type { StageStatus } from '@/types';
import {
    ProcessMessageInputSchema,
    type ProcessMessageInput,
    ProcessMessageOutputSchema,
    type ProcessMessageOutput
} from './schemas';
import { getAdminDb } from '@/lib/firebase-admin';

// #################################################################
//  TOOLS DEFINITION
// #################################################################

const findStageOutputSchema = z.object({
    projectId: z.string(),
    interventionMasterId: z.string(),
    stageId: z.string(),
    stageTitle: z.string(),
    projectTitle: z.string(),
});

const findStageTool = ai.defineTool(
  {
    name: 'findStage',
    description: 'Finds a project stage using a natural language query. Use keywords from the user message, like project titles or stage names (e.g., "technical study for the Athens renovation" or "invoice for Papadopoulos"). This is the first step for any action.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: findStageOutputSchema.nullable(),
  },
  async ({ query }) => {
    try {
        console.log(`[AI Tool] Finding stage with query: "${query}"`);
        const db = getAdminDb();
        const result = await findContextByQuery(db, query);
        // Ensure result is serializable and not undefined.
        return result || null;
    } catch(e: any) {
        console.error(`[AI Tool findStage] DB Error: ${e.message}`);
        return null;
    }
  }
);

const updateStageStatusTool = ai.defineTool(
    {
        name: 'updateStageStatus',
        description: 'Updates the status of a specific stage. Use this if the message implies a task is finished (e.g., "ολοκληρώθηκε", "έγινε η πληρωμή", "τελείωσε").',
        inputSchema: z.object({
            projectId: z.string(),
            stageId: z.string(),
            status: z.enum(['pending', 'in progress', 'completed', 'failed']),
        }),
        outputSchema: z.boolean(),
    },
    async ({ projectId, stageId, status }) => {
        try {
            console.log(`[AI Tool] Updating stage ${stageId} in project ${projectId} to status "${status}"`);
            const db = getAdminDb();
            return await updateStageStatus(db, projectId, stageId, status as StageStatus);
        } catch(e: any) {
            console.error(`[AI Tool updateStageStatus] DB Error: ${e.message}`);
            return false;
        }
    }
);

const addFileToStageTool = ai.defineTool(
    {
        name: 'addFileToStage',
        description: 'Attaches a file to a specific project stage. This should be used whenever a file is provided.',
        inputSchema: z.object({
            projectId: z.string(),
            stageId: z.string(),
            fileName: z.string(),
            dataUri: z.string().describe("The Data URI of the file to attach. This must be passed from the input."),
        }),
        outputSchema: z.boolean(),
    },
    async ({ projectId, stageId, fileName, dataUri }) => {
        try {
            console.log(`[AI Tool] Adding file "${fileName}" to stage ${stageId} in project ${projectId}`);
            const db = getAdminDb();
            return await addFileToStageData(db, projectId, stageId, { name: fileName, url: dataUri });
        } catch (e: any) {
            console.error(`[AI Tool addFileToStage] DB Error: ${e.message}`);
            return false;
        }
    }
);


// #################################################################
//  AI FLOW DEFINITION
// #################################################################

const messageProcessorFlow = ai.defineFlow(
  {
    name: 'messageProcessorFlow',
    inputSchema: ProcessMessageInputSchema,
    outputSchema: ProcessMessageOutputSchema,
  },
  async (input) => {
    
    const llmResponse = await ai.generate({
        prompt: [
            { text: `You are an expert project management assistant for "NESTOR eco", a platform for managing energy-saving projects. Your primary task is to process incoming documents, messages, and emails. You must understand user intent, use tools to interact with project data, and generate a clear summary of your actions. You MUST respond and make all suggestions in GREEK.

            Your process is as follows:
            1.  **Analyze Input**: Examine the user's message text and any provided file. The file might be an invoice, a technical drawing, or a saved email (.pdf, .eml, or text).
            2.  **Find Context**: Use the 'findStage' tool to locate the relevant project and stage. Use keywords from the message, file name, or file content (like an email subject line: "Re: Ανακαίνιση κατοικίας Παπαδόπουλου"). This is your primary context for all other actions. If you cannot find a stage, inform the user clearly and stop.
            3.  **Take Action**:
                *   If the input implies a task is finished (e.g., "ολοκληρώθηκε η μελέτη", "έγινε η πληρωμή"), use the 'updateStageStatus' tool to set the stage to 'completed'.
                *   If a file is provided, you MUST use the 'addFileToStage' tool to attach it to the context you found. You must pass the 'dataUri' from the input to the tool.
            4.  **Summarize and Recommend**:
                *   Formulate a final JSON response.
                *   In the \`responseText\`, confirm the actions you took. If an email was processed, summarize it by mentioning the sender, subject, and date if possible, before stating what you did. For example: "Καταχώρησα το email από τον 'Sender Name' με θέμα 'Subject' στο έργο 'Project Title'. Το αρχείο επισυνάφθηκε και το στάδιο ενημερώθηκε."
                *   If a file was processed, analyze its content to suggest relevant \`tags\` and a \`forwardingRecommendation\` (e.g., 'Λογιστήριο', 'Τεχνικό Τμήμα').
                *   List the tools you used in \`actionsTaken\`.`},
            ...(input.fileInfo ? [{media: {url: input.fileInfo.dataUri}}, {text: `\n\n--- ATTACHED FILE: ${input.fileInfo.name} ---`}] : []),
            { text: `\n\n--- USER MESSAGE ---\n${input.messageText}` }
        ],
        model: 'googleai/gemini-2.0-flash',
        tools: [findStageTool, updateStageStatusTool, addFileToStageTool],
    });
    
    const toolRequests = llmResponse.toolRequests;
    if (toolRequests.length > 0) {
      const toolResponses = [];
      for (const toolRequest of toolRequests) {
        if (toolRequest.name === 'addFileToStage' && input.fileInfo) {
          (toolRequest.input as any).dataUri = input.fileInfo.dataUri;
          (toolRequest.input as any).fileName = (toolRequest.input as any).fileName || input.fileInfo.name;
        }

        if (toolRequest.name === 'findStage') {
          const output = await findStageTool(toolRequest.input);
          toolResponses.push({ toolRequest, output });
        } else if (toolRequest.name === 'updateStageStatus') {
          const output = await updateStageStatusTool(toolRequest.input);
          toolResponses.push({ toolRequest, output });
        } else if (toolRequest.name === 'addFileToStage') {
          const output = await addFileToStageTool(toolRequest.input);
          toolResponses.push({ toolRequest, output });
        }
      }

      const finalResponse = await ai.generate({
        history: [llmResponse, ...toolResponses.map(r => ({ toolResponse: { name: r.toolRequest.name, output: r.output } }))],
        prompt: [{text: 'Based on the tools you used and their results, generate the final response object. In the `responseText`, summarize what you did. If the original input was an email, start the summary by mentioning its key details (sender, subject, date if available) before describing your actions. Include any tags or recommendations if a file was processed. Ensure your output conforms to the schema.'}],
        output: { schema: ProcessMessageOutputSchema },
        model: 'googleai/gemini-2.0-flash',
      });
      return finalResponse.output!;
    }
    
    if (llmResponse.output) {
        return llmResponse.output;
    }

    return {
        responseText: llmResponse.text,
        actionsTaken: [],
    };
  }
);


export async function processMessage(input: ProcessMessageInput): Promise<ProcessMessageOutput> {
  return messageProcessorFlow(input);
}
