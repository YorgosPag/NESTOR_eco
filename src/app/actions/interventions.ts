
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getProjectById, updateProject } from '@/lib/projects-data';
import { getAdminDb } from "@/lib/firebase-admin";
import type { ProjectIntervention } from '@/types';
import { users } from '@/lib/data-helpers';


const AddInterventionSchema = z.object({
  projectId: z.string(),
  interventionName: z.string().min(3, "Το όνομα της παρέμβασης πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
});

export async function addInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = AddInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }

  const { projectId, interventionName } = validatedFields.data;

  try {
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) {
      return { success: false, errors: {}, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
    }

    const newIntervention: ProjectIntervention = {
      masterId: `${interventionName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 7)}`,
      code: 'CUSTOM',
      expenseCategory: interventionName,
      interventionCategory: interventionName,
      interventionSubcategory: interventionName,
      quantity: 0,
      totalCost: 0,
      stages: [],
      subInterventions: [],
    };
    
    if (!project.interventions) {
        project.interventions = [];
    }
    project.interventions.push(newIntervention);

    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Προσθήκη Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Προστέθηκε η παρέμβαση: "${interventionName}".`,
    });

    await updateProject(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in addInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση προστέθηκε με επιτυχία.' };
}


const UpdateInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  interventionSubcategory: z.string().min(3, "Το όνομα της παρέμβασης πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
});

export async function updateInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = UpdateInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
    };
  }

  const { projectId } = validatedFields.data;

  try {
    const { interventionMasterId, interventionSubcategory } = validatedFields.data;
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) {
      return { success: false, errors: {}, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
    }

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention) {
      return { success: false, errors: {}, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
    }

    intervention.interventionSubcategory = interventionSubcategory;
    // Also update interventionCategory if it's a custom one, to keep them in sync for custom interventions.
    if (intervention.code === 'CUSTOM') {
        intervention.interventionCategory = interventionSubcategory;
        intervention.expenseCategory = interventionSubcategory;
    }


    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Επεξεργασία Ονόματος Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Άλλαξε το όνομα της παρέμβασης σε: "${interventionSubcategory}".`,
    });

    await updateProject(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in updateInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση ενημερώθηκε με επιτυχία.' };
}

const DeleteInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
});

export async function deleteInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = DeleteInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }
  const { projectId } = validatedFields.data;

  try {
    const { interventionMasterId } = validatedFields.data;
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) {
      return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
    }

    const interventionIndex = project.interventions.findIndex(i => i.masterId === interventionMasterId);
    if (interventionIndex === -1) {
      return { success: false, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
    }

    const intervention = project.interventions[interventionIndex];
    
    project.interventions.splice(interventionIndex, 1);
    
    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Διαγραφή Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Διαγράφηκε: "${intervention.interventionCategory}".`,
    });
    
    await updateProject(db, projectId, project);
  } catch (error: any) {
    console.error("🔥 ERROR in deleteInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση διαγράφηκε με επιτυχία.' };
}


const UpdateInterventionCostsSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  costOfMaterials: z.coerce.number().min(0, "Το κόστος πρέπει να είναι θετικός αριθμός.").optional(),
  costOfLabor: z.coerce.number().min(0, "Το κόστος πρέπει να είναι θετικός αριθμός.").optional(),
});

export async function updateInterventionCostsAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateInterventionCostsSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
        };
    }

    const { projectId, interventionMasterId, costOfMaterials, costOfLabor } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectById(db, projectId);
        if (!project) {
            return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
        }

        const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
        if (!intervention) {
            return { success: false, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
        }

        if (costOfMaterials !== undefined) intervention.costOfMaterials = costOfMaterials;
        if (costOfLabor !== undefined) intervention.costOfLabor = costOfLabor;

        await updateProject(db, projectId, project);
    } catch (error: any) {
        console.error("🔥 ERROR in updateInterventionCostsAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Το κόστος της παρέμβασης ενημερώθηκε με επιτυχία.' };
}
