
"use server";

import { processMessage } from "@/ai/flows/message-processor";
import type { ProcessMessageInput } from "@/ai/flows/schemas";
import { generateReminder, type GenerateReminderInput } from "@/ai/flows/ai-smart-reminders";
import { revalidatePath } from "next/cache";


export async function processDocumentAction(input: ProcessMessageInput) {
  try {
    const result = await processMessage(input);
    revalidatePath('/'); // Revalidate relevant paths after AI action
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to process document:", error);
    return { success: false, error: `Failed to process document: ${error.message}` };
  }
}

export async function generateReminderAction(input: GenerateReminderInput) {
  try {
    const result = await generateReminder(input);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Failed to generate reminder.", error);
    return { success: false, error: "Failed to generate reminder." };
  }
}
