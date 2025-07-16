
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { 
    updateStageStatus as updateStageStatusData,
    addStageToProject,
    updateStageInProject,
    deleteStageFromProject,
    moveStageInProject
} from '@/lib/projects-data';

const UpdateStageStatusSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
  status: z.enum(['pending', 'in progress', 'completed', 'failed']),
});

export async function updateStageStatusAction(prevState: any, formData: FormData) {
  const validated = UpdateStageStatusSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validated.success) {
    return {
      success: false,
      message: 'Μη έγκυρα δεδομένα για ενημέρωση κατάστασης.',
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const { projectId, stageId, status } = validated.data;

  try {
    const db = getAdminDb();
    const success = await updateStageStatusData(db, projectId, stageId, status);
     if (!success) {
      throw new Error("Stage or project not found for status update.");
    }
    revalidatePath(`/projects/${projectId}`);
    return {
      success: true,
      message: 'Η κατάσταση του σταδίου ενημερώθηκε.',
    };
  } catch (err: any) {
    console.error('🔥 ERROR in updateStageStatusAction:', err);
    return {
      success: false,
      message: "Παρουσιάστηκε ένα τεχνικό σφάλμα. Παρακαλώ δοκιμάστε ξανά.",
    };
  }
}

const AddStageSchema = z.object({
    projectId: z.string(),
    interventionMasterId: z.string(),
    title: z.string().min(3, 'Ο τίτλος πρέπει να έχει τουλάχιστον 3 χαρακτήρες.'),
    deadline: z.string().min(1, 'Η προθεσμία είναι υποχρεωτική.'),
    notes: z.string().optional(),
    assigneeContactId: z.string().optional(),
    supervisorContactId: z.string().optional(),
});

export async function addStageAction(prevState: any, formData: FormData) {
    const validatedFields = AddStageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }
    const { projectId } = validatedFields.data;

    try {
        const db = getAdminDb();
        await addStageToProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in addStageAction:", error);
        return { success: false, message: "Παρουσιάστηκε ένα τεχνικό σφάλμα. Παρακαλώ δοκιμάστε ξανά." };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Το στάδιο προστέθηκε με επιτυχία.' };
}

const UpdateStageSchema = AddStageSchema.extend({
  stageId: z.string(),
});

export async function updateStageAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateStageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }
    const { projectId } = validatedFields.data;

    try {
        const db = getAdminDb();
        await updateStageInProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in updateStageAction:", error);
        return { success: false, message: "Παρουσιάστηκε ένα τεχνικό σφάλμα. Παρακαλώ δοκιμάστε ξανά." };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Το στάδιο ενημερώθηκε με επιτυχία.' };
}

const DeleteStageSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
});

export async function deleteStageAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteStageSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }
    const { projectId } = validatedFields.data;

    try {
        const db = getAdminDb();
        await deleteStageFromProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in deleteStageAction:", error);
        return { success: false, message: "Παρουσιάστηκε ένα τεχνικό σφάλμα. Παρακαλώ δοκιμάστε ξανά." };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Το στάδιο διαγράφηκε με επιτυχία.' };
}

const MoveStageSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  stageId: z.string(),
  direction: z.enum(['up', 'down']),
});

export async function moveStageAction(prevState: any, formData: FormData) {
    const validatedFields = MoveStageSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }
    const { projectId } = validatedFields.data;

    try {
        const db = getAdminDb();
        const result = await moveStageInProject(db, validatedFields.data);
        if (!result.success) {
            return { success: true, message: result.message };
        }
    } catch (error: any) {
        console.error("🔥 ERROR in moveStageAction:", error);
        return { success: false, message: "Παρουσιάστηκε ένα τεχνικό σφάλμα. Παρακαλώ δοκιμάστε ξανά." };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Η σειρά άλλαξε.' };
}
