
/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the reporting flow.
 */
import { z } from 'genkit';

const ChartDataItemSchema = z.object({
  name: z.string().describe("The label for a slice or bar (e.g., a project status name)."),
  value: z.number().describe("The numerical value for the slice or bar (e.g., the count of projects)."),
});

export const ChartDataSchema = z.object({
  type: z.enum(['bar', 'pie']).describe("The suggested type of chart to display based on the data."),
  title: z.string().describe("A descriptive title for the chart."),
  data: z.array(ChartDataItemSchema).describe("The array of data points for the chart."),
});
export type ChartData = z.infer<typeof ChartDataSchema>;

export const ReportOutputSchema = z.union([
    z.string().describe("A text-based answer to the user's query."),
    ChartDataSchema.describe("A structured data response for rendering a chart.")
]);
export type ReportOutput = z.infer<typeof ReportOutputSchema>;
