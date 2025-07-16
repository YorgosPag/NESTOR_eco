
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { addTrigger, updateTrigger, deleteTrigger } from "@/lib/triggers-data";
import type { Trigger } from '@/types';

// Trigger Actions
const TriggerSchema = z.object({
    name: z.string().min(3, "Το όνομα του trigger πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
    code: z.string().min(1, "Επιλέξτε έναν κωδικό."),
    interventionCategory: z.string().min(1, "Επιλέξτε μια έγκυρη κατηγορία παρέμβασης."),
    description: z.string().optional(),
});

export async function createTriggerAction(prevState: any, formData: FormData) {
    const validatedFields = TriggerSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const db = getAdminDb();
        await addTrigger(db, validatedFields.data as Omit<Trigger, 'id'>);
    } catch (error: any) {
        console.error("🔥 ERROR in createTriggerAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    return { success: true, message: 'Το trigger δημιουργήθηκε με επιτυχία.' };
}

const UpdateTriggerSchema = TriggerSchema.extend({
  id: z.string().min(1),
});

export async function updateTriggerAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateTriggerSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const { id, ...data } = validatedFields.data;
        const db = getAdminDb();
        const success = await updateTrigger(db, id, data);
        if (!success) throw new Error("Trigger not found");
    } catch (error: any) {
        console.error("🔥 ERROR in updateTriggerAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    return { success: true, message: 'Το trigger ενημερώθηκε με επιτυχία.' };
}

const DeleteTriggerSchema = z.object({
  id: z.string().min(1),
});

export async function deleteTriggerAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteTriggerSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.' };
    }

    try {
        const db = getAdminDb();
        const success = await deleteTrigger(db, validatedFields.data.id);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in deleteTriggerAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/admin/triggers');
    return { success: true, message: 'Το trigger διαγράφηκε με επιτυχία.' };
}
