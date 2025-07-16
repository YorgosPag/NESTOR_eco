
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import { createCustomList, deleteCustomList, updateCustomList } from '@/lib/custom-lists-data';
import { getAllProjects } from '@/lib/projects-data';
import type { Firestore } from 'firebase-admin/firestore';

// Custom List Actions
const CustomListSchema = z.object({
    name: z.string().min(2, "Το όνομα της λίστας πρέπει να έχει τουλάχιστον 2 χαρακτήρες."),
});

// Mapping of user-facing names to stable system keys.
const SYSTEM_LIST_KEYS: { [name: string]: string } = {
    'Κωδικός': 'CODE',
    'Κατηγορία Παρέμβασης': 'INTERVENTION_CATEGORY',
    'Κατηγορία Δαπάνης': 'EXPENSE_CATEGORY',
    'Υπο-Κατηγορία Παρέμβασης': 'SUB_INTERVENTION_CATEGORY',
    'info': 'INFO',
    'Ενεργειακά Χαρακτηριστικά': 'ENERGY_SPECS',
    'τίτλοι παρεμβάσεων': 'INTERVENTION_TITLES',
    'Ρόλοι Επαφών': 'CONTACT_ROLES',
    'Μονάδες Μέτρησης': 'UNIT_OF_MEASUREMENT',
};

export async function createCustomListAction(prevState: any, formData: FormData) {
    const validatedFields = CustomListSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const { name } = validatedFields.data;
        const db = getAdminDb();
        const key = SYSTEM_LIST_KEYS[name]; // Check if the name matches a system list
        await createCustomList(db, name, key);
    } catch (error: any) {
        console.error("🔥 ERROR in createCustomListAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    revalidatePath('/admin/custom-lists');
    return { success: true, message: 'Η λίστα δημιουργήθηκε με επιτυχία.' };
}

const UpdateCustomListSchema = CustomListSchema.extend({
  id: z.string().min(1),
});

export async function updateCustomListAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateCustomListSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const { id, name } = validatedFields.data;
        const db = getAdminDb();
        await updateCustomList(db, id, name);
    } catch (error: any) {
        console.error("🔥 ERROR in updateCustomListAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    revalidatePath('/admin/custom-lists');
    return { success: true, message: 'Η λίστα ενημερώθηκε με επιτυχία.' };
}

async function findListItemUsage(db: Firestore, listId: string): Promise<string[]> {
    const usage: string[] = [];

    const listItemsSnap = await db.collection('customListItems').where('listId', '==', listId).get();
    if (listItemsSnap.empty) {
        return [];
    }
    const listItemNames = listItemsSnap.docs.map(doc => doc.data().name);
    
    const allProjects = await getAllProjects(db);

    for (const project of allProjects) {
        for (const intervention of project.interventions) {
            if (intervention.selectedEnergySpec && listItemNames.includes(intervention.selectedEnergySpec)) {
                 usage.push(`Έργο: "${project.title}" (Παρέμβαση: ${intervention.interventionCategory}, Ενεργ. Χαρακτ.)`);
            }
            if (intervention.selectedSystemClass && listItemNames.includes(intervention.selectedSystemClass)) {
                 usage.push(`Έργο: "${project.title}" (Παρέμβαση: ${intervention.interventionCategory}, Κλάση Συστήματος)`);
            }
        }
    }
    
    return [...new Set(usage)];
}

const DeleteCustomListSchema = z.object({
  id: z.string().min(1),
});

export async function deleteCustomListAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteCustomListSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.', errors: null };
    }

    try {
        const db = getAdminDb();
        const listId = validatedFields.data.id;

        const usage = await findListItemUsage(db, listId);
        if (usage.length > 0) {
            const listSnap = await db.collection('customLists').doc(listId).get();
            const listName = listSnap.data()?.name || 'Αυτή η λίστα';
            return {
                success: false,
                message: `${listName} δεν μπορεί να διαγραφεί γιατί χρησιμοποιείται.`,
                errors: { usage: usage }
            };
        }

        const success = await deleteCustomList(db, listId);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in deleteCustomListAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}`, errors: null };
    }

    revalidatePath('/admin/triggers');
    revalidatePath('/admin/custom-lists');
    return { success: true, message: 'Η λίστα διαγράφηκε με επιτυχία.', errors: null };
}
