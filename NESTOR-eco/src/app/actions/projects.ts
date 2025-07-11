
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { addProject as addProjectData, getProjectById, users, findInterventionAndStage, updateProject as updateProjectData, deleteProject as deleteProjectData, updateStageStatus as updateStageStatusData } from '@/lib/data';
import type { Project, ProjectIntervention, Stage, StageStatus, SubIntervention } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";

const CreateProjectSchema = z.object({
  title: z.string({invalid_type_error: "Παρακαλώ εισάγετε έναν έγκυρο τίτλο."}).min(3, "Ο τίτλος του έργου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  applicationNumber: z.string().optional(),
  ownerContactId: z.string().min(1, "Παρακαλώ επιλέξτε έναν ιδιοκτήτη."),
  deadline: z.string().optional(),
});

export async function createProjectAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = CreateProjectSchema.safeParse({
      title: formData.get('title'),
      applicationNumber: formData.get('applicationNumber'),
      ownerContactId: formData.get('ownerContactId'),
      deadline: formData.get('deadline'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία με σφάλμα και προσπαθήστε ξανά.',
      };
    }

    const { title, applicationNumber, ownerContactId, deadline } = validatedFields.data;
    const db = getAdminDb();

    const newProject: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'> = {
      title,
      applicationNumber,
      ownerContactId,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
      status: 'Quotation',
      interventions: [],
      auditLog: [
          {
              id: `log-${Date.now()}`,
              user: users[0], 
              action: 'Δημιουργία Προσφοράς',
              timestamp: new Date().toISOString(),
              details: `Το έργο "${title}" δημιουργήθηκε σε φάση προσφοράς.`
          }
      ],
    };

    await addProjectData(db, newProject);
  } catch (error: any) {
    console.error("🔥 ERROR in createProjectAction:", error);
    return { message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/projects');
  redirect('/projects');
}

const UpdateProjectSchema = z.object({
    id: z.string().min(1, "Το ID του έργου είναι απαραίτητο."),
    title: z.string({invalid_type_error: "Παρακαλώ εισάγετε έναν έγκυρο τίτλο."}).min(3, "Ο τίτλος του έργου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
    applicationNumber: z.string().optional(),
    ownerContactId: z.string().min(1, "Παρακαλώ επιλέξτε έναν ιδιοκτήτη."),
    deadline: z.string().optional(),
});

export async function updateProjectAction(prevState: any, formData: FormData) {
    const validatedFields = UpdateProjectSchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        applicationNumber: formData.get('applicationNumber'),
        ownerContactId: formData.get('ownerContactId'),
        deadline: formData.get('deadline'),
    });

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }
    const { id } = validatedFields.data;

    try {
        const db = getAdminDb();
        const { title, applicationNumber, ownerContactId, deadline } = validatedFields.data;
        const projectData = {
            title,
            applicationNumber,
            ownerContactId,
            deadline: deadline ? new Date(deadline).toISOString() : '',
        };

        const success = await updateProjectData(db, id, projectData);
        if (!success) {
            throw new Error("Το έργο δεν βρέθηκε για ενημέρωση.");
        }
    } catch (error: any) {
        console.error("🔥 ERROR in updateProjectAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/projects/${id}`);
    return { success: true, message: 'Το έργο ενημερώθηκε με επιτυχία.' };
}

const ActivateProjectSchema = z.object({
  projectId: z.string().min(1),
});

export async function activateProjectAction(prevState: any, formData: FormData) {
  const validatedFields = ActivateProjectSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρο ID έργου.' };
  }
  const { projectId } = validatedFields.data;

  try {
    const db = getAdminDb();
    
    const project = await getProjectById(db, projectId);
    if (!project) {
        throw new Error("Το έργο δεν βρέθηκε.");
    }
    
    const auditLog = project.auditLog || [];
    auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Ενεργοποίηση Έργου',
      timestamp: new Date().toISOString(),
      details: 'Η κατάσταση του έργου άλλαξε από "Προσφορά" σε "Εντός Χρονοδιαγράμματος".',
    });

    const updateData = {
        status: 'On Track',
        auditLog: auditLog
    };

    const success = await updateProjectData(db, projectId, updateData);
    if (!success) {
      throw new Error("Η ενεργοποίηση του έργου απέτυχε.");
    }
  } catch (error: any) {
    console.error("🔥 ERROR in activateProjectAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects`);
  revalidatePath(`/dashboard`);
  return { success: true, message: 'Το έργο ενεργοποιήθηκε με επιτυχία.' };
}


const DeleteProjectSchema = z.object({
  id: z.string().min(1),
});

export async function deleteProjectAction(prevState: any, formData: FormData) {
    try {
        const validatedFields = DeleteProjectSchema.safeParse({
            id: formData.get('id'),
        });

        if (!validatedFields.success) {
            return { success: false, message: 'Μη έγκυρα δεδομένα.' };
        }
        
        const db = getAdminDb();
        await deleteProjectData(db, validatedFields.data.id);
    } catch (error: any) {
        console.error("🔥 ERROR in deleteProjectAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'Το έργο διαγράφηκε με επιτυχία.' };
}

const UpdateStageSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
  title: z.string().min(3, "Ο τίτλος του σταδίου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Παρακαλώ εισάγετε μια έγκυρη ημερομηνία." }),
  notes: z.string().optional(),
  assigneeContactId: z.string().optional(),
  supervisorContactId: z.string().optional(),
});

export async function updateStageAction(prevState: any, formData: FormData) {
  const validatedFields = UpdateStageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
    return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.' };
  }
  const { projectId } = validatedFields.data;

  try {
    const { stageId, title, deadline, notes, assigneeContactId, supervisorContactId } = validatedFields.data;
    const db = getAdminDb();
    const lookup = await findInterventionAndStage(db, projectId, stageId);
    if (!lookup) {
      return { success: false, errors: {}, message: 'Σφάλμα: Το στάδιο ή το έργο δεν βρέθηκε.' };
    }

    const { project, intervention, stage } = lookup;
    
    if (project.deadline && new Date(deadline) > new Date(project.deadline)) {
        const formattedDeadline = new Date(project.deadline).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return { success: false, errors: { deadline: [`Η ημερομηνία λήξης δεν μπορεί να είναι μετά την προθεσμία του έργου (${formattedDeadline}).`] }, message: 'Σφάλμα επικύρωσης.' };
    }

    stage.title = title;
    stage.deadline = new Date(deadline).toISOString();
    stage.notes = notes || '';
    stage.assigneeContactId = assigneeContactId === 'none' ? undefined : assigneeContactId;
    stage.supervisorContactId = supervisorContactId === 'none' ? undefined : supervisorContactId;
    stage.lastUpdated = new Date().toISOString();

    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0], 
      action: 'Επεξεργασία Σταδίου',
      timestamp: new Date().toISOString(),
      details: `Ενημερώθηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
    });

    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

  } catch (error: any) {
    console.error("🔥 ERROR in updateStageAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
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
    const { stageId } = validatedFields.data;
    const db = getAdminDb();
    const lookup = await findInterventionAndStage(db, projectId, stageId);
    if (!lookup) {
      return { success: false, message: 'Σφάλμα: Το στάδιο ή το έργο δεν βρέθηκε.' };
    }

    const { project, intervention, stage } = lookup;
    
    const stageIndex = intervention.stages.findIndex(s => s.id === stageId);
    if (stageIndex === -1) {
      return { success: false, message: 'Σφάλμα: Το στάδιο δεν βρέθηκε στην παρέμβαση.' };
    }

    intervention.stages.splice(stageIndex, 1);
    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Διαγραφή Σταδίου',
      timestamp: new Date().toISOString(),
      details: `Διαγράφηκε το στάδιο "${stage.title}" από την παρέμβαση "${intervention.interventionCategory}".`,
    });
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

  } catch (error: any) {
    console.error("🔥 ERROR in deleteStageAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Το στάδιο διαγράφηκε με επιτυχία.' };
}

const UpdateStageStatusSchema = z.object({
  projectId: z.string(),
  stageId: z.string(),
  status: z.enum(['pending', 'in progress', 'completed', 'failed']),
});

export async function updateStageStatusAction(prevState: any, formData: FormData) {
  // This handles being called directly from a form or via useFormState
  const effectiveFormData = formData instanceof FormData ? formData : prevState;

  if (!(effectiveFormData instanceof FormData)) {
    return { success: false, message: 'Μη έγκυρα δεδομένα φόρμας.' };
  }

  const validatedFields = UpdateStageStatusSchema.safeParse(Object.fromEntries(effectiveFormData.entries()));

  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }

  const { projectId, stageId, status } = validatedFields.data;

  try {
    const db = getAdminDb();
    const success = await updateStageStatusData(db, projectId, stageId, status);
    if (!success) {
      throw new Error("Το στάδιο δεν βρέθηκε για ενημέρωση κατάστασης.");
    }
  } catch (error: any) {
    console.error("🔥 ERROR in updateStageStatusAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η κατάσταση του σταδίου ενημερώθηκε.' };
}

const AddStageSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  title: z.string().min(3, "Ο τίτλος του σταδίου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Παρακαλώ εισάγετε μια έγκυρη ημερομηνία." }),
  notes: z.string().optional(),
  assigneeContactId: z.string().optional(),
  supervisorContactId: z.string().optional(),
});

export async function addStageAction(prevState: any, formData: FormData) {
  const validatedFields = AddStageSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validatedFields.success) {
      return { success: false, errors: validatedFields.error.flatten().fieldErrors, message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία.' };
  }
  const { projectId } = validatedFields.data;

  try {
    const { interventionMasterId, title, deadline, notes, assigneeContactId, supervisorContactId } = validatedFields.data;
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) {
        return { success: false, message: 'Σφάλμα: Το έργο δεν βρέθηκε.' };
    }
    
    if (project.deadline && new Date(deadline) > new Date(project.deadline)) {
        const formattedDeadline = new Date(project.deadline).toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return { success: false, errors: { deadline: [`Η ημερομηνία λήξης δεν μπορεί να είναι μετά την προθεσμία του έργου (${formattedDeadline}).`] }, message: 'Σφάλμα επικύρωσης.' };
    }

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention) {
        return { success: false, message: 'Σφάλμα: Η παρέμβαση δεν βρέθηκε.' };
    }

    const newStage: Stage = {
        id: `${intervention.masterId}-stage-${Date.now()}`,
        title,
        status: 'pending',
        deadline: new Date(deadline).toISOString(),
        lastUpdated: new Date().toISOString(),
        files: [],
        notes: notes || '',
        assigneeContactId: assigneeContactId === 'none' ? undefined : assigneeContactId,
        supervisorContactId: supervisorContactId === 'none' ? undefined : supervisorContactId,
    };

    intervention.stages.push(newStage);

    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Προσθήκη Σταδίου',
      timestamp: new Date().toISOString(),
      details: `Προστέθηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
    });
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

  } catch (error: any) {
    console.error("🔥 ERROR in addStageAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Το στάδιο προστέθηκε με επιτυχία.' };
}

const MoveStageSchema = z.object({
  projectId: z.string(),
  interventionMasterId: z.string(),
  stageId: z.string(),
  direction: z.enum(['up', 'down']),
});

export async function moveStageAction(prevState: any, formData: FormData) {
  const effectiveFormData = formData instanceof FormData ? formData : prevState;

  if (!(effectiveFormData instanceof FormData)) {
    return { success: false, message: 'Μη έγκυρα δεδομένα φόρμας.' };
  }
  
  const validatedFields = MoveStageSchema.safeParse(Object.fromEntries(effectiveFormData.entries()));
  if (!validatedFields.success) {
    return { success: false, message: 'Μη έγκυρα δεδομένα.' };
  }
  const { projectId, interventionMasterId, stageId, direction } = validatedFields.data;

  try {
    const db = getAdminDb();
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Δεν βρέθηκε το έργο.');

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention) throw new Error('Δεν βρέθηκε η παρέμβαση.');

    const stages = intervention.stages;
    const fromIndex = stages.findIndex(s => s.id === stageId);
    if (fromIndex === -1) throw new Error('Δεν βρέθηκε το στάδιο.');
    
    const currentStage = stages[fromIndex];

    let toIndex = -1;
    if (direction === 'up') {
        for (let i = fromIndex - 1; i >= 0; i--) {
            if (stages[i].status === currentStage.status) {
                toIndex = i;
                break;
            }
        }
    } else { // down
        for (let i = fromIndex + 1; i < stages.length; i++) {
            if (stages[i].status === currentStage.status) {
                toIndex = i;
                break;
            }
        }
    }

    if (toIndex !== -1) {
        [stages[fromIndex], stages[toIndex]] = [stages[toIndex], stages[fromIndex]];
    } else {
        return { success: true, message: 'Δεν είναι δυνατή η περαιτέρω μετακίνηση.' };
    }

    project.auditLog.unshift({
      id: `log-${Date.now()}`,
      user: users[0],
      action: 'Αλλαγή Σειράς Σταδίου',
      timestamp: new Date().toISOString(),
      details: `Άλλαξε η σειρά του σταδίου "${currentStage.title}".`,
    });
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

  } catch (error: any) {
    console.error("🔥 ERROR in moveStageAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η σειρά του σταδίου άλλαξε.' };
}

const LogEmailNotificationSchema = z.object({
    projectId: z.string(),
    stageId: z.string(),
    assigneeName: z.string(),
});

export async function logEmailNotificationAction(prevState: any, formData: FormData) {
    const validatedFields = LogEmailNotificationSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα για καταγραφή.' };
    }

    const { projectId, stageId, assigneeName } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectById(db, projectId);
        if (!project) throw new Error('Project not found');

        const lookup = await findInterventionAndStage(db, projectId, stageId);
        if (!lookup) throw new Error('Stage not found');

        const { stage, intervention } = lookup;
        
        project.auditLog.unshift({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Αποστολή Email',
            timestamp: new Date().toISOString(),
            details: `Εστάλη ειδοποίηση στον/στην ${assigneeName} για το στάδιο "${stage.title}" της παρέμβασης "${intervention.interventionCategory}".`,
        });
        
        const { progress, alerts, status, budget, ...projectToUpdate } = project;
        await updateProjectData(db, projectId, projectToUpdate);

    } catch (error: any) {
        console.error("🔥 ERROR in logEmailNotificationAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Η αποστολή email καταγράφηκε.' };
}
