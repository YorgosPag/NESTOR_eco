
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { addContact, updateContact, deleteContact } from '@/lib/contacts-data';
import type { ContactRole } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";

const ContactSchema = z.object({
  firstName: z.string().min(2, "Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες."),
  lastName: z.string().min(2, "Το επώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες."),
  email: z.string().email("Παρακαλώ εισάγετε μια έγκυρη διεύθυνση email.").optional().or(z.literal('')),
  
  mobilePhone: z.string().regex(/^\d{10}$/, "Το κινητό τηλέφωνο πρέπει να αποτελείται από ακριβώς 10 ψηφία.").optional().or(z.literal('')),
  landlinePhone: z.string().regex(/^\d{10}$/, "Το σταθερό τηλέφωνο πρέπει να αποτελείται από ακριβώς 10 ψηφία.").optional().or(z.literal('')),

  addressStreet: z.string().optional(),
  addressNumber: z.string().optional(),
  addressArea: z.string().optional(),
  addressPostalCode: z.string().regex(/^\d{5}$/, "Ο Τ.Κ. πρέπει να αποτελείται από ακριβώς 5 ψηφία.").optional().or(z.literal('')),
  addressCity: z.string().optional(),
  addressPrefecture: z.string().optional(),

  role: z.string().min(1, "Παρακαλώ επιλέξτε έναν ρόλο."),
  specialty: z.string().optional(),
  company: z.string().optional(),
  avatar: z.string().optional(),
  notes: z.string().optional(),
  
  // Personal Info
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  placeOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),

  // ID Info
  vatNumber: z.string().regex(/^\d{9}$/, "Το ΑΦΜ πρέπει να αποτελείται από ακριβώς 9 ψηφία.").optional().or(z.literal('')),
  idNumber: z.string().optional(),
  idIssueDate: z.string().optional(),
  idIssuingAuthority: z.string().optional(),

  // Taxis Info
  usernameTaxis: z.string().optional(),
  passwordTaxis: z.string().optional(),

  // Social Media
  facebookUrl: z.string().url("Παρακαλώ εισάγετε ένα έγκυρο URL.").optional().or(z.literal('')),
  instagramUrl: z.string().url("Παρακαλώ εισάγετε ένα έγκυρο URL.").optional().or(z.literal('')),
  tiktokUrl: z.string().url("Παρακαλώ εισάγετε ένα έγκυρο URL.").optional().or(z.literal('')),
});

export async function createContactAction(prevState: any, formData: FormData) {
  const validatedFields = ContactSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }

  try {
    const db = getAdminDb();
    await addContact(db, validatedFields.data);
  } catch (error: any) {
    console.error("🔥 ERROR in createContactAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }
  
  revalidatePath('/contacts');
  return { success: true, message: 'Η επαφή δημιουργήθηκε με επιτυχία.' };
}

const UpdateContactSchema = ContactSchema.extend({
  id: z.string().min(1),
});

export async function updateContactAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateContactSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }

    try {
        const { id, ...contactData } = validatedFields.data;
        const db = getAdminDb();
        const success = await updateContact(db, id, contactData);
        if (!success) throw new Error("Contact not found");
    } catch (error: any) {
        console.error("🔥 ERROR in updateContactAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/contacts');
    return { success: true, message: 'Η επαφή ενημερώθηκε με επιτυχία.' };
}

const DeleteContactSchema = z.object({
  id: z.string().min(1),
});

export async function deleteContactAction(prevState: any, formData: FormData) {
    const validatedFields = DeleteContactSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }

    try {
        const db = getAdminDb();
        await deleteContact(db, validatedFields.data.id);
    } catch (error: any) {
        console.error("🔥 ERROR in deleteContactAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/contacts');
    return { success: true, message: 'Η επαφή διαγράφηκε με επιτυχία.' };
}
