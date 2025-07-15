

"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Project, Contact, Stage, StageStatus } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";
import { getContacts as getContactsData } from '@/lib/contacts-data';
import { 
    getAllProjects as getAllProjectsData,
    getProjectById as getProjectDataById, 
    getProjectsByIds as getProjectsDataByIds,
    addProject as addProjectData,
    updateProject as updateProjectData,
    deleteProject as deleteProjectData,
    updateStageStatus as updateStageStatusData,
    addStageToProject,
    updateStageInProject,
    deleteStageFromProject,
    moveStageInProject,
    logEmailNotificationInProject
} from '@/lib/projects-data';

export async function getProjectById(id: string) {
    const db = getAdminDb();
    return getProjectDataById(db, id);
}

export async function getProjectsByIds(ids: string[]) {
    const db = getAdminDb();
    return getProjectsDataByIds(db, ids);
}

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
      message: `Σφάλμα ενημέρωσης κατάστασης: ${err.message}`,
    };
  }
}

export async function getBatchWorkOrderData(projectIds: string[]): Promise<{ projects: Project[], contacts: Contact[] }> {
    const db = getAdminDb();
    
    const [allContacts, resolvedProjects] = await Promise.all([
        getContactsData(db),
        getProjectsDataByIds(db, projectIds),
    ]);

    return {
        projects: resolvedProjects,
        contacts: allContacts,
    };
}

const CreateProjectSchema = z.object({
    title: z.string({invalid_type_error: "Παρακαλώ εισάγετε έναν έγκυρο τίτλο."}).min(3, "Ο τίτλος του έργου πρέπει να έχει τουλάχιστον 3 χαρακτήρες."),
    applicationNumber: z.string().optional(),
    ownerContactId: z.string().min(1, "Παρακαλώ επιλέξτε έναν ιδιοκτήτη."),
    deadline: z.string().optional(),
});

export async function createProjectAction(prevState: any, formData: FormData) {
    const validatedFields = CreateProjectSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία με σφάλμα και προσπαθήστε ξανά.',
        };
    }
    
    try {
        const db = getAdminDb();
        await addProjectData(db, validatedFields.data);
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
    const validatedFields = UpdateProjectSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Σφάλμα. Παρακαλώ διορθώστε τα πεδία και προσπαθήστε ξανά.',
        };
    }
    const { id, ...projectData } = validatedFields.data;

    try {
        const db = getAdminDb();
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
        const success = await updateProjectData(db, projectId, { status: 'On Track' }, true);
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
    const validatedFields = DeleteProjectSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, message: 'Μη έγκυρα δεδομένα.' };
    }
        
    try {
        const db = getAdminDb();
        await deleteProjectData(db, validatedFields.data.id);
    } catch (error: any) {
        console.error("🔥 ERROR in deleteProjectAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath('/dashboard');
    revalidatePath('/projects');
    redirect('/projects');
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

    try {
        const db = getAdminDb();
        await logEmailNotificationInProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in logEmailNotificationAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${validatedFields.data.projectId}`);
    return { success: true, message: 'Η αποστολή email καταγράφηκε.' };
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
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
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
        const db = getAdminDb();
        await deleteStageFromProject(db, validatedFields.data);
    } catch (error: any) {
        console.error("🔥 ERROR in deleteStageAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
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
            return { success: true, message: 'Δεν είναι δυνατή η περαιτέρω μετακίνηση.' };
        }
    } catch (error: any) {
        console.error("🔥 ERROR in moveStageAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${projectId}`);
    return { success: true, message: 'Η σειρά άλλαξε.' };
}


export async function exportProjectsToMarkdownAction() {
  try {
    const db = getAdminDb();
    const [projects, contacts] = await Promise.all([
      getAllProjectsData(db),
      getContactsData(db),
    ]);

    if (projects.length === 0) {
      return { success: true, data: "Δεν βρέθηκαν έργα στη βάση δεδομένων." };
    }

    let markdown = '# Λίστα Έργων Βάσης Δεδομένων\n\n';
    markdown += 'Ακολουθούν τα αναλυτικά στοιχεία για όλα τα έργα που είναι καταχωρημένα στο σύστημα.\n\n---\n\n';

    projects.forEach((project, index) => {
        const owner = contacts.find(c => c.id === project.ownerContactId);
        markdown += `## ${index + 1}. ${project.title}\n\n`;
        markdown += `- **ID Έργου:** ${project.id}\n`;
        markdown += `- **Αρ. Αίτησης:** ${project.applicationNumber || 'Δ/Υ'}\n`;
        markdown += `- **Ιδιοκτήτης:** ${owner ? `${owner.firstName} ${owner.lastName}` : 'Άγνωστος'}\n`;
        markdown += `- **Κατάσταση:** ${project.status}\n`;
        markdown += `- **Προϋπολογισμός:** €${project.budget.toLocaleString('el-GR')}\n`;
        markdown += `- **Προθεσμία:** ${project.deadline ? new Date(project.deadline).toLocaleDateString('el-GR') : 'Δ/Υ'}\n`;
        
        if (project.interventions.length > 0) {
            markdown += `\n### Παρεμβάσεις (${project.interventions.length}):\n`;
            project.interventions.forEach(intervention => {
                markdown += `\n- **${intervention.interventionCategory} / ${intervention.interventionSubcategory || ''}**\n`;
                if(intervention.subInterventions && intervention.subInterventions.length > 0){
                    markdown += `  - **Ανάλυση Κόστους:**\n`;
                    intervention.subInterventions.forEach(sub => {
                        markdown += `    - ${sub.description}: €${sub.cost.toLocaleString('el-GR')}\n`;
                    });
                }
            });
        }
        
        markdown += `\n---\n\n`;
    });

    return { success: true, data: markdown };
  } catch (error: any) {
    console.error("🔥 ERROR in exportProjectsToMarkdownAction:", error);
    return { success: false, error: `Η εξαγωγή απέτυχε: ${error.message}` };
  }
}
