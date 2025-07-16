
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createCustomListItem, updateCustomListItem, deleteCustomListItem } from '@/lib/custom-lists-data';
import { getAdminDb } from "@/lib/firebase-admin";

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
        revalidatePath('/admin/custom-lists');
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
    revalidatePath('/admin/custom-lists');
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
    revalidatePath('/admin/custom-lists');
    return { success: true, message: 'Το αντικείμενο διαγράφηκε με επιτυχία.' };
}
