'use server';

/**
 * @fileOverview This is the central AI processing flow for the application.
 * It handles incoming messages, with or without files, determines user intent,
 * uses tools to interact with project data, and generates comprehensive responses
 * including summaries, suggested tags, and forwarding recommendations.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { findContextByQuery, updateStageStatus, addFileToStage as addFileToStageData } from '@/lib/data';
import type { StageStatus } from '@/types';
import {
    ProcessMessageInputSchema,
    type ProcessMessageInput,
    ProcessMessageOutputSchema,
    type ProcessMessageOutput
} from './schemas';

// #################################################################
//  TOOLS DEFINITION
// #################################################################

const findStageTool = ai.defineTool(
  {
    name: 'findStage',
    description: 'Finds a project stage using a natural language query. Use keywords from the user message, like project titles or stage names (e.g., "technical study for the Athens renovation" or "invoice for Papadopoulos"). This is the first step for any action.',
    inputSchema: z.object({ query: z.string() }),
    outputSchema: z.object({
        projectId: z.string(),
        interventionMasterId: z.string(),
        stageId: z.string(),
        stageTitle: z.string(),
        projectTitle: z.string(),
    }).nullable(),
  },
  async ({ query }) => {
    console.log(`[AI Tool] Finding stage with query: "${query}"`);
    return findContextByQuery(query);
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
        console.log(`[AI Tool] Updating stage ${stageId} in project ${projectId} to status "${status}"`);
        return updateStageStatus(projectId, stageId, status as StageStatus);
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
        console.log(`[AI Tool] Adding file "${fileName}" to stage ${stageId} in project ${projectId}`);
        // The URL saved in the data store IS the data URI.
        return addFileToStageData(projectId, stageId, { name: fileName, url: dataUri });
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
    system: `You are an expert project management assistant for "NESTOR eco", a platform for managing energy-saving projects. Your task is to process incoming messages, understand user intent, and take action using the available tools. You MUST respond and make all suggestions in GREEK.
    
    Your process is as follows:
    1.  Analyze the user's message text to understand the context. Use the 'findStage' tool to locate the relevant project and stage. This is your primary context for all other actions. If you cannot find a stage, inform the user clearly and stop.
    2.  If the user's message implies a task is finished (e.g., "ολοκληρώθηκε η μελέτη", "έγινε η πληρωμή"), use the 'updateStageStatus' tool to set the stage to 'completed'.
    3.  If a file is provided in the input, you MUST use the 'addFileToStage' tool to attach it to the context you found in step 1. You must pass the 'dataUri' from the input to the tool.
    4.  If a file was processed, analyze its likely content (based on its name and the message context) to suggest relevant tags and recommend which department/role it should be forwarded to (e.g., 'Λογιστήριο', 'Τεχνικό Τμήμα').
    5.  Formulate a final JSON response containing a 'responseText' in GREEK confirming the actions you took, a list of 'actionsTaken', and any 'tags' or 'forwardingRecommendation' you generated. If you couldn't do something, 'responseText' should explain why clearly.`
  },
  async (input) => {
    
    const promptMessage: any[] = [{ text: input.messageText }];
    if (input.fileInfo) {
      // Pass the file to the LLM for context, though the tool will handle the actual saving.
      promptMessage.push({ media: { url: input.fileInfo.dataUri } });
    }

    const llmResponse = await ai.generate({
        prompt: {
            text: input.messageText,
            media: input.fileInfo ? [{url: input.fileInfo.dataUri}] : undefined,
        },
        tools: [findStageTool, updateStageStatusTool, addFileToStageTool],
        model: 'googleai/gemini-2.0-flash',
        // Add output schema to guide the final response after tool calls
        output: { schema: ProcessMessageOutputSchema } 
    });
    
    // Check for tool calls and execute them
    const toolCalls = llmResponse.toolCalls();
    if (toolCalls.length > 0) {
       // IMPORTANT: Pass the file info to tool calls if needed, especially for addFileToStage
       const populatedToolCalls = toolCalls.map(call => {
           if (call.name === 'addFileToStage' && input.fileInfo) {
               return {
                   ...call,
                   args: {
                       ...call.args,
                       fileName: call.args.fileName || input.fileInfo.name,
                       dataUri: input.fileInfo.dataUri,
                   }
               }
           }
           return call;
       });

       const toolResponses = await ai.runToolCalls(populatedToolCalls);

       // Call the LLM again with the tool responses to get the final, structured output
       const finalResponse = await ai.generate({
         history: [llmResponse, ...toolResponses],
         prompt: 'Based on the tools you used and their results, generate the final response object. Summarize what you did in the `responseText` field. Include any tags or recommendations if a file was processed. Ensure your output conforms to the schema.',
         output: { schema: ProcessMessageOutputSchema },
         model: 'googleai/gemini-2.0-flash',
       });
       return finalResponse.output!;
    }
    
    // If no tools were called, but there's a file, we can still ask for tags.
    // Or if there are no tools and no file, the LLM might just be chatting.
    // In this case, we can just return the text response and empty actions.
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
