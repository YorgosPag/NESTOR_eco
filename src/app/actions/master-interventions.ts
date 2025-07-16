
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { addMasterIntervention, updateMasterIntervention, deleteMasterIntervention } from "@/lib/interventions-data";
import type { MasterIntervention } from '@/types';

// Master Interventions Actions
const MasterInterventionSchema = z.object({
    code: z.string().min(1, "Ο κωδικός είναι υποχρεωτικός."),
    info: z.string().optional(),
    energySpecsOptions: z.string().optional(),
    expenseCategory: z.string().min(1, "Επιλέξτε μια έγκυρη κατηγορία δαπάνης."),
    interventionCategory: z.string().min(1, "Επιλέξτε μια έγκυρη κατηγορία παρέμβασης."),
    interventionSubcategory: z.string().optional(),
    unit: z.string().min(1, "Η μονάδα μέτρησης είναι υποχρεωτική."),
    maxUnitPrice: z.coerce.number().positive("Το κόστος/μονάδα πρέπει να είναι θετικός αριθμός."),
    maxAmount: z.coerce.number().positive("Το μέγιστο ποσό πρέπει να είναι θετικός αριθμός."),
});

export async function createMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = MasterInterventionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const data = validatedFields.data;
        const db = getAdminDb();
        const success = await addMasterIntervention(db, data as Omit<MasterIntervention, 'id'>);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in createMasterInterventionAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση δημιουργήθηκε με επιτυχία.' };
}

const UpdateMasterInterventionSchema = MasterInterventionSchema.extend({
  id: z.string().min(1),
});

export async function updateMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateMasterInterventionSchema.safeParse(Object.fromEntries(formData.entries()));
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
        const success = await updateMasterIntervention(db, id, data);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in updateMasterInterventionAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση ενημερώθηκε με επιτυχία.' };
}

const DeleteMasterInterventionSchema = z.object({
  id: z.string().min(1),
});

export async function deleteMasterInterventionAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteMasterInterventionSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.' };
    }

    try {
        const db = getAdminDb();
        const success = await deleteMasterIntervention(db, validatedFields.data.id);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in deleteMasterInterventionAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/admin');
    return { success: true, message: 'Η master παρέμβαση διαγράφηκε με επιτυχία.' };
}
