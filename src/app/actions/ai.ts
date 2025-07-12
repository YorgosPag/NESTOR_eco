
"use server";

import { revalidatePath } from 'next/cache';
import { processMessage } from "@/ai/flows/message-processor";
import type { ProcessMessageInput, ReportOutput } from "@/ai/flows/schemas";
import { generateReminder, type GenerateReminderInput } from "@/ai/flows/ai-smart-reminders";
import { generateReport } from "@/ai/flows/reporting-flow";


export async function processDocumentAction(input: ProcessMessageInput) {
  try {
    const result = await processMessage(input);
    revalidatePath('/'); // Revalidate relevant paths after AI action
    return { success: true, data: result };
  } catch (error: any) {
    console.error("🔥 ERROR in processDocumentAction:", error);
    return { success: false, error: `Failed to process document: ${error.message}` };
  }
}

export async function generateReminderAction(input: GenerateReminderInput) {
  try {
    const result = await generateReminder(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("🔥 ERROR in generateReminderAction:", error);
    return { success: false, error: `Failed to generate reminder: ${error.message}` };
  }
}

export async function generateReportAction(query: string) {
  try {
    const result: ReportOutput = await generateReport(query);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("🔥 ERROR in generateReportAction:", error);
    return { success: false, error: `Failed to generate report: ${error.message}` };
  }
}
