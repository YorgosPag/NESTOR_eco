
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { logEmailNotificationInProject } from '@/lib/projects-data';


const LogEmailNotificationSchema = z.object({
    projectId: z.string(),
    stageId: z.string(),
    assigneeName: z.string(),
});

export async function logEmailNotificationAction(prevState: any, formData: FormData) {
    const validatedFields = LogEmailNotificationSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα για καταγραφή.' };
    }

    try {
        const db = getAdminDb();
        await logEmailNotificationInProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in logEmailNotificationAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${validatedFields.data.projectId}`);
    return { success: true, message: 'Η αποστολή email καταγράφηκε.' };
}
