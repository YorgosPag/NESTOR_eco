
'use server';
/**
 * @fileOverview Defines the data structures (schemas) for AI flow inputs and outputs.
 */
import { z } from 'zod';

// #################################################################
//  MESSAGE PROCESSOR SCHEMAS
// #################################################################

export const ProcessMessageFileInfoSchema = z.object({
  dataUri: z.string().describe("A data URI of the file, which must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  name: z.string().describe('The original name of the file.'),
  mimeType: z.string().describe('The MIME type of the file (e.g., "application/pdf").'),
});
export type ProcessMessageFileInfo = z.infer<typeof ProcessMessageFileInfoSchema>;

export const ProcessMessageInputSchema = z.object({
  messageText: z.string().optional().describe('Optional user-provided text about the document.'),
  fileInfo: ProcessMessageFileInfoSchema.optional().describe('The file to be processed.'),
});
export type ProcessMessageInput = z.infer<typeof ProcessMessageInputSchema>;


export const ProcessMessageOutputSchema = z.object({
  responseText: z
    .string()
    .describe('A brief, friendly summary of the actions taken or suggestions made, in Greek.'),
  tags: z
    .array(z.string())
    .optional()
    .describe('A list of suggested tags for the document, in Greek.'),
  forwardingRecommendation: z
    .string()
    .optional()
    .describe('A suggestion on which stage or person this document should be forwarded to, in Greek.'),
});
export type ProcessMessageOutput = z.infer<typeof ProcessMessageOutputSchema>;


// #################################################################
//  REPORTING SCHEMAS
// #################################################################

export const ChartDataSchema = z.object({
    type: z.enum(['bar', 'pie']).describe("The type of chart to display."),
    title: z.string().describe("The title of the chart."),
    data: z.array(z.object({
        name: z.string().describe("The name of the data point (e.g., a category on the x-axis or a pie slice)."),
        value: z.number().describe("The numerical value of the data point.")
    })).describe("The data points for the chart.")
});
export type ChartData = z.infer<typeof ChartDataSchema>;


export const ReportOutputSchema = z.union([
    z.string().describe("A text-based answer to the user's query, formatted for readability."),
    ChartDataSchema.describe("A structured chart data object when a visual representation is requested.")
]);
export type ReportOutput = z.infer<typeof ReportOutputSchema>;
