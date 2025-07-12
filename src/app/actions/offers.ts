
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { addOffer } from '@/lib/offers-data';
import type { Offer, OfferItem } from '@/types';

// Zod schema for validating a single offer item
const OfferItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Η περιγραφή του αντικειμένου είναι υποχρεωτική."),
  unit: z.string().min(1, "Η μονάδα μέτρησης είναι υποχρεωτική."),
  quantity: z.coerce.number().min(0, "Η ποσότητα πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  unitPrice: z.coerce.number().positive("Η τιμή μονάδας πρέπει να είναι θετικός αριθμός."),
});

// Zod schema for validating the entire offer form
const CreateOfferSchema = z.object({
  supplierId: z.string().min(1, "Πρέπει να επιλέξετε προμηθευτή."),
  type: z.enum(['general', 'perProject']),
  projectId: z.string().optional(),
  description: z.string().min(3, "Η περιγραφή πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  fileUrl: z.string().url().optional(),
  items: z.preprocess((val) => {
    // Preprocess to handle the stringified items array from the form
    if (typeof val === 'string') {
        try {
            return JSON.parse(val);
        } catch (e) {
            return [];
        }
    }
    return val;
  }, z.array(OfferItemSchema).min(1, "Πρέπει να υπάρχει τουλάχιστον μία γραμμή προσφοράς.")),
});

export async function createOfferAction(prevState: any, formData: FormData) {
  const validatedFields = CreateOfferSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία με σφάλμα.',
    };
  }

  try {
    const db = getAdminDb();
    
    // Prepare data for saving, removing unnecessary properties like 'id' from items
    const { items, ...offerData } = validatedFields.data;
    const offerToSave: Omit<Offer, 'id' | 'createdAt'> = {
        ...offerData,
        supplierType: 'vendor', // Placeholder, can be dynamic later
        items: items.map(({ id, ...rest }) => rest), // Remove client-side temp id
    };
    
    await addOffer(db, offerToSave);
  } catch (error: any) {
    console.error('🔥 ERROR in createOfferAction:', error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath('/supplier-offers');
  return { success: true, message: 'Η προσφορά καταχωρήθηκε με επιτυχία.' };
}
