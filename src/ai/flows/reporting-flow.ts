
'use server';
/**
 * @fileOverview An AI-powered reporting flow that answers natural language questions
 * about project data using tools.
 * - generateReport - A function that handles the report generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { getAllProjects } from '@/app/actions/projects';
import { getContacts } from '@/lib/contacts-data';
import { getAdminDb } from '@/lib/firebase-admin';
import { ReportOutputSchema, type ReportOutput } from './reporting-schemas';

// #################################################################
//  TOOLS DEFINITION
// #################################################################

const getProjectsTool = ai.defineTool(
  {
    name: 'getProjects',
    description: 'Retrieves a list of all projects with their details, including interventions, stages, budget, and status. Use this tool to answer questions about multiple projects, or to find a specific project if its ID is unknown.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    try {
        console.log(`[AI Tool] Getting all projects.`);
        const db = getAdminDb();
        // The data must be simplified to avoid overwhelming the context window and ensure serializability.
        const projects = await getAllProjects(db);
        return projects.map(p => ({
            id: p.id,
            title: p.title,
            ownerContactId: p.ownerContactId,
            status: p.status,
            budget: p.budget,
            deadline: p.deadline,
            interventions: p.interventions.map(i => ({
                category: i.interventionCategory,
                stages: i.stages.map(s => ({
                    title: s.title,
                    status: s.status,
                    deadline: s.deadline,
                    assigneeContactId: s.assigneeContactId
                }))
            }))
        }));
    } catch(e: any) {
        console.error(`[AI Tool getProjects] DB Error: ${e.message}`);
        return { error: `Database error: ${e.message}` };
    }
  }
);


const getContactsTool = ai.defineTool(
    {
        name: 'getContacts',
        description: 'Retrieves a list of all contacts, including their roles, specialties, and contact information. Use this to find contact details or to cross-reference contact IDs found in project data.',
        inputSchema: z.object({}),
        outputSchema: z.any(),
    },
    async () => {
        try {
            console.log(`[AI Tool] Getting all contacts.`);
            const db = getAdminDb();
            // The data must be serializable.
            const contacts = await getContacts(db);
             return contacts.map(c => ({
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                role: c.role,
                specialty: c.specialty
            }));
        } catch(e: any) {
            console.error(`[AI Tool getContacts] DB Error: ${e.message}`);
            return { error: `Database error: ${e.message}` };
        }
    }
);


// #################################################################
//  AI FLOW DEFINITION
// #################################################################

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: z.string(),
    outputSchema: ReportOutputSchema,
  },
  async (query) => {
    
    const llmResponse = await ai.generate({
        prompt: [{text: `You are a helpful data analyst assistant for the "NESTOR eco" project management app.
    Your task is to answer user questions about their projects.
    You MUST respond in Greek.
    Use the provided tools to fetch the necessary data (projects and contacts).
    Analyze the data returned by the tools to formulate a clear, concise, and accurate answer to the user's query.
    If the data is insufficient to answer the question, state that clearly.
    When mentioning people, use their full name if you can find it using the getContacts tool.
    If the user asks for a visual representation like a chart, graph, or pie, you MUST structure your response using the provided ChartData schema. For all other questions, provide a text-based (string) answer. Do not return raw JSON as a string.
    \n\nHere is the user's question:\n${query}`}],
        tools: [getProjectsTool, getContactsTool],
        model: 'googleai/gemini-2.0-flash',
    });
    
    const toolRequests = llmResponse.toolRequests;
    if (!toolRequests || toolRequests.length === 0) {
        const finalResponse = await ai.generate({
            prompt: [{text: query}],
            model: 'googleai/gemini-2.0-flash',
            output: { schema: ReportOutputSchema }
        });
        return finalResponse.output!;
    }

    const toolResponses = [];
    for (const toolRequest of toolRequests) {
        if (toolRequest.name === 'getProjects') {
            const output = await getProjectsTool(toolRequest.input);
            toolResponses.push({ toolRequest, output });
        } else if (toolRequest.name === 'getContacts') {
            const output = await getContactsTool(toolRequest.input);
            toolResponses.push({ toolRequest, output });
        }
    }

    const finalResponse = await ai.generate({
        history: [llmResponse, ...toolResponses.map(r => ({ toolResponse: { name: r.toolRequest.name, output: r.output } }))],
        prompt: [{text: 'Based on the user query and the data you fetched, generate the final response. If a chart was requested, use the provided schema. Otherwise, generate a user-friendly response in Greek. Format it nicely for readability.'}],
        model: 'googleai/gemini-2.0-flash',
        output: { schema: ReportOutputSchema }
    });
    return finalResponse.output!;
  }
);


export async function generateReport(query: string): Promise<ReportOutput> {
  return generateReportFlow(query);
}
