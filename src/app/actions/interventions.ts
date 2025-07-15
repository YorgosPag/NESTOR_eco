
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getProjectById, updateProjectData } from '@/lib/projects-data';
import { getAdminDb } from "@/lib/firebase-admin";
import type { ProjectIntervention, SubIntervention } from '@/types';
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

    await updateProjectData(db, projectId, project);

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

    await updateProjectData(db, projectId, project);

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
    
    await updateProjectData(db, projectId, project);
  } catch (error: any) {
    console.error("🔥 ERROR in deleteInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση διαγράφηκε με επιτυχία.' };
}


const AddSubInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  subcategoryCode: z.string().min(1, "Ο κωδικός είναι υποχρεωτικός."),
  description: z.string().min(3, "Η περιγραφή πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  quantity: z.coerce.number().optional(),
  quantityUnit: z.string().optional(),
  cost: z.coerce.number().positive("Το κόστος πρέπει να είναι θετικός αριθμός."),
  costOfMaterials: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  costOfLabor: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  unitCost: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  implementedQuantity: z.coerce.number().min(0, "Η ποσότητα πρέπει να είναι μη αρνητικός αριθμός.").optional(),
});

export async function addSubInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = AddSubInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
    };
  }

  const { projectId, interventionMasterId } = validatedFields.data;

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

    const { subcategoryCode, description, cost, quantity, quantityUnit, costOfMaterials, costOfLabor, unitCost, implementedQuantity } = validatedFields.data;
    const newSubIntervention: SubIntervention = {
        id: `sub-${Date.now()}`,
        subcategoryCode,
        description,
        cost,
        quantity,
        quantityUnit,
        costOfMaterials: costOfMaterials || 0,
        costOfLabor: costOfLabor || 0,
        unitCost: unitCost || 0,
        implementedQuantity: implementedQuantity || 0,
    };

    if (!intervention.subInterventions) {
        intervention.subInterventions = [];
    }
    intervention.subInterventions.push(newSubIntervention);
    
    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Προσθήκη Υπο-Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Προστέθηκε η υπο-παρέμβαση "${description}" στην παρέμβαση "${intervention.interventionCategory}".`,
    });
    
    await updateProjectData(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in addSubInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η υπο-παρέμβαση προστέθηκε με επιτυχία.' };
}

const UpdateSubInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  subInterventionId: z.string(),
  subcategoryCode: z.string().min(1, "Ο κωδικός είναι υποχρεωτικός."),
  expenseCategory: z.string().optional(),
  description: z.string().min(3, "Η περιγραφή πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  quantity: z.coerce.number().optional(),
  quantityUnit: z.string().optional(),
  cost: z.coerce.number().positive("Το κόστος πρέπει να είναι θετικός αριθμός."),
  costOfMaterials: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  costOfLabor: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  unitCost: z.coerce.number().min(0, "Το κόστος πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  implementedQuantity: z.coerce.number().min(0, "Η ποσότητα πρέπει να είναι μη αρνητικός αριθμός.").optional(),
  selectedEnergySpec: z.string().optional(),
});

export async function updateSubInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = UpdateSubInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.',
    };
  }

  const { projectId, interventionMasterId, subInterventionId } = validatedFields.data;

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
    
    if (!intervention.subInterventions) {
        return { success: false, message: 'Σφάλμα: Δεν βρέθηκαν υπο-παρεμβάσεις.' };
    }

    const subIntervention = intervention.subInterventions.find(sub => sub.id === subInterventionId);
    if (!subIntervention) {
        return { success: false, message: 'Σφάλμα: Η υπο-παρέμβαση δεν βρέθηκε.' };
    }

    const { subcategoryCode, description, cost, quantity, quantityUnit, costOfMaterials, costOfLabor, unitCost, implementedQuantity, expenseCategory, selectedEnergySpec } = validatedFields.data;
    subIntervention.subcategoryCode = subcategoryCode;
    subIntervention.expenseCategory = expenseCategory;
    subIntervention.description = description;
    subIntervention.cost = cost;
    subIntervention.quantity = quantity;
    subIntervention.quantityUnit = quantityUnit;
    subIntervention.costOfMaterials = costOfMaterials || 0;
    subIntervention.costOfLabor = costOfLabor || 0;
    subIntervention.unitCost = unitCost || 0;
    subIntervention.implementedQuantity = implementedQuantity || 0;
    subIntervention.selectedEnergySpec = selectedEnergySpec;
    
    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Επεξεργασία Υπο-Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Επεξεργάστηκε η υπο-παρέμβαση "${description}" στην παρέμβαση "${intervention.interventionCategory}".`,
    });
    
    await updateProjectData(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in updateSubInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η υπο-παρέμβαση ενημερώθηκε με επιτυχία.' };
}

const DeleteSubInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  subInterventionId: z.string(),
});

export async function deleteSubInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = DeleteSubInterventionSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
      return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }

  const { projectId, interventionMasterId, subInterventionId } = validatedFields.data;

  try {
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) {
      return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
    }

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention || !intervention.subInterventions) {
      return { success: false, message: 'Σφάλμα: Η παρέμβαση ή οι υπο-παρεμβάσεις δεν βρέθηκαν.' };
    }

    const subInterventionIndex = intervention.subInterventions.findIndex(sub => sub.id === subInterventionId);
    if (subInterventionIndex === -1) {
        return { success: false, message: 'Σφάλμα: Η υπο-παρέμβαση δεν βρέθηκε.' };
    }

    const deletedSubIntervention = intervention.subInterventions.splice(subInterventionIndex, 1)[0];
    
    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Διαγραφή Υπο-Παρέμβασης',
      timestamp: new Date().toISOString(),
      details: `Διαγράφηκε η υπο-παρέμβαση "${deletedSubIntervention.description}" από την παρέμβαση "${intervention.interventionCategory}".`,
    });
    
    await updateProjectData(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in deleteSubInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η υπο-παρέμβαση διαγράφηκε με επιτυχία.' };
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

        await updateProjectData(db, projectId, project);
    } catch (error: any) {
        console.error("🔥 ERROR in updateInterventionCostsAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Το κόστος της παρέμβασης ενημερώθηκε με επιτυχία.' };
}

const MoveSubInterventionSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  subInterventionId: z.string(),
  direction: z.enum(['up', 'down']),
});

export async function moveSubInterventionAction(prevState: any, formData: FormData) {
  const validatedFields = MoveSubInterventionSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }
  const { projectId, interventionMasterId, subInterventionId, direction } = validatedFields.data;

  try {
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Δεν βρέθηκε το έργο.');

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention || !intervention.subInterventions) throw new Error('Δεν βρέθηκε η παρέμβαση.');

    const subInterventions = intervention.subInterventions;
    const fromIndex = subInterventions.findIndex(s => s.id === subInterventionId);
    if (fromIndex === -1) throw new Error('Δεν βρέθηκε η υπο-παρέμβαση.');
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex >= 0 && toIndex < subInterventions.length) {
        [subInterventions[fromIndex], subInterventions[toIndex]] = [subInterventions[toIndex], subInterventions[fromIndex]];
    } else {
        return { success: true, message: 'Δεν είναι δυνατή η περαιτέρω μετακίνηση.' };
    }
    
    await updateProjectData(db, projectId, project);

  } catch (error: any) {
    console.error("🔥 ERROR in moveSubInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η σειρά άλλαξε.' };
}
