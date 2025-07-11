/**
 * @fileOverview Defines the Zod schemas and TypeScript types for the message processor flow.
 *
 * - ProcessMessageInputSchema, ProcessMessageInput, FileInfo
 * - ProcessMessageOutputSchema, ProcessMessageOutput
 */
import { z } from 'genkit';

export const ProcessMessageInputSchema = z.object({
  messageText: z.string().describe("The text content of the user's message."),
  fileInfo: z
    .object({
      dataUri: z
        .string()
        .describe(
          "A file, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
        ),
      name: z.string(),
      mimeType: z.string(),
    })
    .optional()
    .describe('Information about any attached file.'),
});
export type ProcessMessageInput = z.infer<typeof ProcessMessageInputSchema>;
export type FileInfo = z.infer<
  typeof ProcessMessageInputSchema.shape.fileInfo
>;

export const ProcessMessageOutputSchema = z.object({
  responseText: z
    .string()
    .describe(
      'A confirmation message in Greek to send back to the user about the actions taken.'
    ),
  actionsTaken: z
    .array(z.string())
    .describe('A list of actions performed by the AI (tool names).'),
  tags: z
    .array(z.string())
    .optional()
    .describe(
      'An array of suggested tags for the document, if a file was provided.'
    ),
  forwardingRecommendation: z
    .string()
    .optional()
    .describe(
      'A recommendation of which department/role the document should be forwarded to, in Greek.'
    ),
});
export type ProcessMessageOutput = z.infer<typeof ProcessMessageOutputSchema>;
