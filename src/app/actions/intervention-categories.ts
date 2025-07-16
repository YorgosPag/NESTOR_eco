
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { addInterventionCategory as addInterventionCategoryData, updateInterventionCategory as updateInterventionCategoryData, deleteInterventionCategory as deleteInterventionCategoryData } from '@/lib/intervention-category-data';

// Intervention Category Actions
const InterventionCategorySchema = z.object({
    name: z.string().min(3, "Το όνομα της κατηγορίας πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
});

export async function createInterventionCategoryAction(prevState: any, formData: FormData) {
    const validatedFields = InterventionCategorySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const db = getAdminDb();
        await addInterventionCategoryData(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in createInterventionCategoryAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    return { success: true, message: 'Η κατηγορία δημιουργήθηκε με επιτυχία.' };
}

const UpdateInterventionCategorySchema = InterventionCategorySchema.extend({
  id: z.string().min(1),
});

export async function updateInterventionCategoryAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateInterventionCategorySchema.safeParse(Object.fromEntries(formData.entries()));
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
        const success = await updateInterventionCategoryData(db, id, data);
        if (!success) throw new Error("Category not found");
    } catch (error: any) {
        console.error("🔥 ERROR in updateInterventionCategoryAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    return { success: true, message: 'Η κατηγορία ενημερώθηκε με επιτυχία.' };
}

const DeleteInterventionCategorySchema = z.object({
  id: z.string().min(1),
});

export async function deleteInterventionCategoryAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteInterventionCategorySchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.' };
    }

    try {
        const db = getAdminDb();
        const success = await deleteInterventionCategoryData(db, validatedFields.data.id);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in deleteInterventionCategoryAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/admin/triggers');
    return { success: true, message: 'Η κατηγορία διαγράφηκε με επιτυχία.' };
}
