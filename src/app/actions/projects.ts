

"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Project, Contact, Stage, Attachment, User, StageStatus } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";
import { getContacts as getContactsData, getContactById as getContactDataById } from '@/lib/contacts-data';
import { users } from '@/lib/data-helpers';
import { calculateClientProjectMetrics } from '@/lib/client-utils';
import { 
    getAllProjects as getAllProjectsData,
    getProjectById as getProjectDataById, 
    getProjectsByIds as getProjectsDataByIds,
    updateProjectData,
    addProjectData,
    deleteProjectData,
    findInterventionAndStage as findInterventionAndStageData,
    updateStageStatus as updateStageStatusData
} from '@/lib/projects-data';

export async function getProjectById(id: string) {
    const db = getAdminDb();
    return getProjectDataById(db, id);
}

export async function getProjectsByIds(ids: string[]) {
    const db = getAdminDb();
    return getProjectsDataByIds(db, ids);
}

export async function findInterventionAndStage(projectId: string, stageId: string) {
    const db = getAdminDb();
    return findInterventionAndStageData(db, projectId, stageId);
}

export async function updateStageStatus(projectId: string, stageId: string, status: StageStatus) {
    const db = getAdminDb();
    return updateStageStatusData(db, projectId, stageId, status);
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
    await updateStageStatus(db, projectId, stageId, status);
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

// =================================================================
// Server Actions
// =================================================================

export async function getBatchWorkOrderData(projectIds: string[]): Promise<{ projects: Project[], contacts: Contact[] }> {
    const db = getAdminDb();
    
    const [allContacts, resolvedProjects] = await Promise.all([
        getContactsData(db),
        getProjectsDataByIds(db, projectIds),
    ]);

    const clientSideProjects = resolvedProjects.map(p => calculateClientProjectMetrics(p));

    return {
        projects: clientSideProjects,
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
        
        const project = await getProjectDataById(db, projectId);
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

    const { projectId, stageId, assigneeName } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectDataById(db, projectId);
        if (!project) throw new Error('Project not found');

        const lookup = await findInterventionAndStageData(db, projectId, stageId);
        if (!lookup) throw new Error('Stage not found');

        const { stage, intervention } = lookup;
        
        project.auditLog.unshift({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Αποστολή Email',
            timestamp: new Date().toISOString(),
            details: `Εστάλη ειδοποίηση στον/στην ${assigneeName} για το στάδιο "${stage.title}" της παρέμβασης "${intervention.interventionCategory}".`,
        });
        
        await updateProjectData(db, projectId, project);

    } catch (error: any) {
        console.error("🔥 ERROR in logEmailNotificationAction:", error);
        return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
    }

    revalidatePath(`/projects/${projectId}`);
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
    const { projectId, interventionMasterId } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectDataById(db, projectId);
        if (!project) throw new Error('Project not found');

        const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
        if (!intervention) throw new Error('Intervention not found');
        
        const { title, deadline, notes, assigneeContactId, supervisorContactId } = validatedFields.data;

        const newStage: Stage = {
            id: `stage-${Date.now()}`,
            title,
            status: 'pending',
            deadline: new Date(deadline).toISOString(),
            lastUpdated: new Date().toISOString(),
            files: [],
            notes: notes || undefined,
            assigneeContactId: assigneeContactId && assigneeContactId !== 'none' ? assigneeContactId : undefined,
            supervisorContactId: supervisorContactId && supervisorContactId !== 'none' ? supervisorContactId : undefined,
        };

        intervention.stages.push(newStage);

        project.auditLog.unshift({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Προσθήκη Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Προστέθηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
        });
        
        await updateProjectData(db, projectId, project);

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
    const { projectId, stageId } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectDataById(db, projectId);
        if (!project) throw new Error('Project not found');

        const lookup = await findInterventionAndStageData(db, projectId, stageId);
        if (!lookup) throw new Error('Stage not found');
        
        const { stage, intervention } = lookup;
        
        const { title, deadline, notes, assigneeContactId, supervisorContactId } = validatedFields.data;
        
        stage.title = title;
        stage.deadline = new Date(deadline).toISOString();
        stage.notes = notes || undefined;
        stage.assigneeContactId = assigneeContactId && assigneeContactId !== 'none' ? assigneeContactId : undefined;
        stage.supervisorContactId = supervisorContactId && supervisorContactId !== 'none' ? supervisorContactId : undefined;
        stage.lastUpdated = new Date().toISOString();

        project.auditLog.unshift({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Επεξεργασία Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Επεξεργάστηκε το στάδιο "${title}" στην παρέμβαση "${intervention.interventionCategory}".`,
        });

        await updateProjectData(db, projectId, project);

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
    const { projectId, stageId } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectDataById(db, projectId);
        if (!project) throw new Error('Project not found');

        const lookup = await findInterventionAndStageData(db, projectId, stageId);
        if (!lookup) throw new Error('Stage or intervention not found');
        
        const { stage, intervention } = lookup;
        
        const stageIndex = intervention.stages.findIndex(s => s.id === stageId);
        if (stageIndex === -1) throw new Error('Stage index not found in intervention');

        intervention.stages.splice(stageIndex, 1);
        
        project.auditLog.unshift({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Διαγραφή Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Διαγράφηκε το στάδιο "${stage.title}" από την παρέμβαση "${intervention.interventionCategory}".`,
        });

        await updateProjectData(db, projectId, project);

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
    const { projectId, interventionMasterId, stageId, direction } = validatedFields.data;

    try {
        const db = getAdminDb();
        const project = await getProjectDataById(db, projectId);
        if (!project) throw new Error('Project not found');

        const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
        if (!intervention) throw new Error('Intervention not found');

        const stages = intervention.stages;
        const fromIndex = stages.findIndex(s => s.id === stageId);
        if (fromIndex === -1) throw new Error('Stage not found');
        
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

        if (toIndex >= 0 && toIndex < stages.length) {
            [stages[fromIndex], stages[toIndex]] = [stages[toIndex], stages[fromIndex]]; // Swap
        } else {
            return { success: true, message: 'Δεν είναι δυνατή η περαιτέρω μετακίνηση.' };
        }
        
        await updateProjectData(db, projectId, project);

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
        const projects = await getAllProjectsData(db);
        const contacts = await getContactsData(db);
        if (projects.length === 0) {
            return { success: true, data: "Δεν βρέθηκαν έργα στη βάση δεδομένων." };
        }
        let markdown = '# Λίστα Έργων Βάσης Δεδομένων\n\n';
        markdown += 'Ακολουθούν τα αναλυτικά στοιχεία για όλα τα έργα που είναι καταχωρημένα στο σύστημα.\n\n---\n\n';
    
        for (const project of projects) {
            markdown += `## ${project.title || 'Έργο χωρίς τίτλο'} (ID: ${project.id})\n\n`;
            markdown += `- **Αρ. Αίτησης:** ${project.applicationNumber || 'Δ/Υ'}\n`;
            markdown += `- **Κατάσταση:** ${project.status || 'Δ/Υ'}\n`;
            if (project.deadline) {
                markdown += `- **Προθεσμία:** ${new Date(project.deadline).toLocaleDateString('el-GR')}\n`;
            }
            
            if (project.ownerContactId) {
                const owner = contacts.find(c => c.id === project.ownerContactId);
                markdown += `- **Ιδιοκτήτης:** ${owner ? `${owner.firstName} ${owner.lastName}` : 'Άγνωστος'}\n`;
            }
    
            markdown += `\n### Παρεμβάσεις\n\n`;
            if (project.interventions && project.interventions.length > 0) {
                project.interventions.forEach(intervention => {
                    markdown += `#### ${intervention.interventionSubcategory || intervention.interventionCategory}\n`;
                    if (intervention.subInterventions && intervention.subInterventions.length > 0) {
                        markdown += '| Κωδικός | Περιγραφή | Κόστος |\n';
                        markdown += '|:---|:---|---:|\n';
                        intervention.subInterventions.forEach(sub => {
                            markdown += `| ${sub.subcategoryCode} | ${sub.description} | ${sub.cost.toLocaleString('el-GR', { style: 'currency', currency: 'EUR' })} |\n`;
                        });
                         markdown += '\n';
                    }
    
                    if (intervention.stages && intervention.stages.length > 0) {
                        markdown += '**Στάδια Υλοποίησης:**\n';
                         intervention.stages.forEach(stage => {
                             markdown += `- **${stage.title}**: ${stage.status} (Προθεσμία: ${new Date(stage.deadline).toLocaleDateString('el-GR')})\n`;
                         });
                         markdown += '\n';
                    }
                });
            } else {
                markdown += `_Δεν υπάρχουν καταχωρημένες παρεμβάσεις για αυτό το έργο._\n\n`;
            }
            markdown += '---\n\n';
        }
        return { success: true, data: markdown };
    } catch (error: any) {
        console.error("🔥 ERROR in exportProjectsToMarkdownAction:", error);
        return { success: false, error: `Η εξαγωγή απέτυχε: ${error.message}` };
    }
}
