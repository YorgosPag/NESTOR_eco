
'use server';
/**
 * @fileOverview An AI-powered reporting flow that answers natural language questions
 * about project data using tools.
 * - generateReport - A function that handles the report generation process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAllProjects } from '@/lib/projects-data';
import { getAllContacts } from '@/lib/contacts-data';
import { getAdminDb } from '@/lib/firebase-admin';
import { ReportOutputSchema, type ReportOutput } from './schemas';

// #################################################################
//  TOOLS DEFINITION
// #################################################################

const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  ownerContactId: z.string().optional(),
  status: z.string(),
  budget: z.number(),
  deadline: z.string().optional(),
  interventions: z.array(z.object({
    category: z.string(),
    stages: z.array(z.object({
      title: z.string(),
      status: z.string(),
      deadline: z.string(),
      assigneeContactId: z.string().optional(),
    }))
  }))
});

const ContactSchema = z.object({
    id: z.string(),
    name: z.string(),
    role: z.string(),
    specialty: z.string().optional(),
});


const getProjectsTool = ai.defineTool(
  {
    name: 'getProjects',
    description: 'Retrieves a list of all projects with their details, including interventions, stages, budget, and status. Use this tool to answer questions about multiple projects, or to find a specific project if its ID is unknown.',
    inputSchema: z.object({}),
    outputSchema: z.array(ProjectSchema),
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
        return [];
    }
  }
);


const getContactsTool = ai.defineTool(
    {
        name: 'getContacts',
        description: 'Retrieves a list of all contacts, including their roles, specialties, and contact information. Use this to find contact details or to cross-reference contact IDs found in project data.',
        inputSchema: z.object({}),
        outputSchema: z.array(ContactSchema),
    },
    async () => {
        try {
            console.log(`[AI Tool] Getting all contacts.`);
            const db = getAdminDb();
            // The data must be serializable.
            const contacts = await getAllContacts(db);
             return contacts.map(c => ({
                id: c.id,
                name: `${c.firstName} ${c.lastName}`,
                role: c.role,
                specialty: c.specialty
            }));
        } catch(e: any) {
            console.error(`[AI Tool getContacts] DB Error: ${e.message}`);
            return [];
        }
    }
);


// #################################################################
//  AI FLOW DEFINITION
// #################################################################

const reportingPrompt = ai.definePrompt({
    name: "reportingPrompt",
    tools: [getProjectsTool, getContactsTool],
    output: { schema: ReportOutputSchema },
    prompt: `You are a helpful data analyst assistant for the "NESTOR eco" project management app.
Your task is to answer user questions about their projects.
You MUST respond in Greek.
Use the provided tools to fetch the necessary data (projects and contacts).
Analyze the data returned by the tools to formulate a clear, concise, and accurate answer to the user's query.
If the data is insufficient to answer the question, state that clearly.
When mentioning people, use their full name if you can find it using the getContacts tool.
If the user asks for a visual representation like a chart, graph, or pie, you MUST structure your response using the provided ChartData schema. For all other questions, provide a text-based (string) answer. Do not return raw JSON as a string.
Format your final text response for readability.
\n\nHere is the user's question:
{{{query}}}
`,
});


const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: z.string(),
    outputSchema: ReportOutputSchema,
  },
  async (query) => {
    
    const llmResponse = await reportingPrompt({query});
    
    return llmResponse.output!;
  }
);


export async function generateReport(query: string): Promise<ReportOutput> {
  return generateReportFlow(query);
}
