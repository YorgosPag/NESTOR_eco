
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from "@/lib/firebase-admin";
import type { Firestore } from 'firebase-admin/firestore';
import { addMasterIntervention, updateMasterIntervention, deleteMasterIntervention } from "@/lib/interventions-data";
import { addTrigger, updateTrigger, deleteTrigger } from "@/lib/triggers-data";
import { addInterventionCategory as addInterventionCategoryData, updateInterventionCategory as updateInterventionCategoryData, deleteInterventionCategory as deleteInterventionCategoryData } from '@/lib/intervention-category-data';
import { createCustomList, deleteCustomList, createCustomListItem, updateCustomListItem, deleteCustomListItem, updateCustomList } from '@/lib/custom-lists-data';
import { getAllProjects } from '@/app/actions/projects';
import type { MasterIntervention, Project, Trigger } from '@/types';


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
    } catch (error: any)
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
    return { success: true, message: 'Η λίστα διαγράφηκε με επιτυχία.', errors: null };
}


// Custom List Item Actions
const CustomListItemSchema = z.object({
    name: z.string().min(1, "Το πεδίο ονομάτων δεν μπορεί να είναι κενό."),
    listId: z.string().min(1, "Το ID της λίστας είναι υποχρεωτικό."),
});

export async function createCustomListItemAction(prevState: any, formData: FormData) {
    const validatedFields = CustomListItemSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    const { listId, name: namesString } = validatedFields.data;
    const names = namesString.split(';').map(n => n.trim()).filter(Boolean);
    const uniqueNames = [...new Set(names.map(n => n.toLowerCase()))]
        .map(lowerCaseName => names.find(n => n.toLowerCase() === lowerCaseName)!);

    if (uniqueNames.length === 0) {
        return {
            success: false,
            errors: { name: ['Παρακαλώ εισάγετε τουλάχιστον ένα έγκυρο όνομα.'] },
            message: 'Δεν βρέθηκαν ονόματα για προσθήκη.',
        };
    }
    
    try {
        const db = getAdminDb();
        
        const itemsSnapshot = await db.collection('customListItems').where('listId', '==', listId).get();
        const existingNames = new Set(itemsSnapshot.docs.map(doc => doc.data().name.toLowerCase()));
        
        const newNamesToAdd = uniqueNames.filter(name => !existingNames.has(name.toLowerCase()));
        const duplicateNames = uniqueNames.filter(name => existingNames.has(name.toLowerCase()));

        if (newNamesToAdd.length > 0) {
            const batch = db.batch();
            for (const nameToAdd of newNamesToAdd) {
                const docRef = db.collection('customListItems').doc();
                batch.set(docRef, { listId, name: nameToAdd });
            }
            await batch.commit();
        }
        
        let message = '';
        if (newNamesToAdd.length > 0) {
            message += `Προστέθηκαν ${newNamesToAdd.length} νέα αντικείμενα. `;
        }
        if (duplicateNames.length > 0) {
            message += `${duplicateNames.length} αντικείμενα (${duplicateNames.join(', ')}) υπήρχαν ήδη και αγνοήθηκαν.`;
        }
        if (!message) {
            message = 'Δεν προστέθηκαν νέα αντικείμενα, καθώς υπήρχαν ήδη.';
        }

        revalidatePath('/admin/triggers');
        return { success: true, message: message.trim(), errors: {} };

    } catch (error: any) {
        console.error("🔥 ERROR in createCustomListItemAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
}

const UpdateCustomListItemSchema = CustomListItemSchema.extend({
  id: z.string().min(1),
});

export async function updateCustomListItemAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateCustomListItemSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }
    
    try {
        const { id, name, listId } = validatedFields.data;
        const db = getAdminDb();

        const itemsSnapshot = await db.collection('customListItems').where('listId', '==', listId).get();
        const existingItem = itemsSnapshot.docs.find(doc => doc.id !== id && doc.data().name.toLowerCase() === name.toLowerCase());
        
        if (existingItem) {
             return {
                success: false,
                errors: { name: ['Ένα άλλο αντικείμενο με αυτό το όνομα υπάρχει ήδη σε αυτή τη λίστα.'] },
                message: 'Σφάλμα. Το όνομα χρησιμοποιείται ήδη.',
            };
        }

        const success = await updateCustomListItem(db, id, name);
        if (!success) throw new Error("Item not found");
    } catch (error: any) {
        console.error("🔥 ERROR in updateCustomListItemAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }
    
    revalidatePath('/admin/triggers');
    return { success: true, message: 'Το αντικείμενο ενημερώθηκε με επιτυχία.' };
}

const DeleteCustomListItemSchema = z.object({
  id: z.string().min(1),
});

export async function deleteCustomListItemAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteCustomListItemSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρο ID.' };
    }

    try {
        const db = getAdminDb();
        const success = await deleteCustomListItem(db, validatedFields.data.id);
        if (!success) throw new Error("Firestore operation failed");
    } catch (error: any) {
        console.error("🔥 ERROR in deleteCustomListItemAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/admin/triggers');
    return { success: true, message: 'Το αντικείμενο διαγράφηκε με επιτυχία.' };
}
