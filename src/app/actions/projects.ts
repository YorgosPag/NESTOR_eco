
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Project, Contact, Attachment, User, StageStatus } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";
import { getContacts as getContactsData } from '@/lib/contacts-data';
import { firestore } from "firebase-admin";
import { users } from '@/lib/data-helpers';
import { calculateClientProjectMetrics } from '@/lib/client-utils';


// =================================================================
// Data fetching (formerly from src/lib/data.ts)
// =================================================================

export async function getProjectById(db: firestore.Firestore, id: string): Promise<Project | undefined> {
    const projectsCollection = db.collection('projects');
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    // Note: Metrics are now calculated on the client to handle time-sensitive data like 'Delayed' status.
    const projectData = { id: doc.id, ...doc.data() } as Project;
    return projectData;
};

export async function getProjectsByIds(db: firestore.Firestore, ids: string[]): Promise<Project[]> {
    if (!ids || ids.length === 0) {
        return [];
    }
    const projectsCollection = db.collection('projects');
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    const promises = chunks.map(chunk => 
        projectsCollection.where(firestore.FieldPath.documentId(), 'in', chunk).get()
    );

    const snapshots = await Promise.all(promises);
    const projects: Project[] = [];
    snapshots.forEach(snapshot => {
        const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        projects.push(...projs);
    });
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => p !== undefined);
};
  
export async function getAllProjects(db: firestore.Firestore): Promise<Project[]> {
    const projectsCollection = db.collection('projects');
    const snapshot = await projectsCollection.orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
    return projects;
};
  
export async function addProjectData(db: firestore.Firestore, project: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'>) {
    const projectsCollection = db.collection('projects');
    await projectsCollection.add(project);
};
  
export async function updateProjectData(db: firestore.Firestore, id: string, updates: Partial<Project>) {
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).update(updates);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
  
export async function deleteProjectData(db: firestore.Firestore, id: string): Promise<boolean> {
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
};
  
export async function findInterventionAndStage(db: firestore.Firestore, projectId: string, stageId: string) {
    const project = await getProjectById(db, projectId);
    if (!project) return null;

    for (const intervention of project.interventions) {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            return { project, intervention, stage };
        }
    }
    return null;
};
  
export async function addFileToStage(db: firestore.Firestore, projectId: string, stageId: string, file: Pick<Attachment, 'name' | 'url'>): Promise<boolean> {
    const project = await getProjectById(db, projectId);
    if (!project) return false;

    let fileAdded = false;
    project.interventions.forEach(intervention => {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            fileAdded = true;
            const newFile: Attachment = {
                ...file,
                id: `file-${Date.now()}`,
                uploadedAt: new Date().toISOString(),
            };
            if (!stage.files) {
                stage.files = [];
            }
            stage.files.push(newFile);
            stage.lastUpdated = new Date().toISOString();
            project.auditLog.unshift({
                id: `log-${Date.now()}`,
                user: users[0],
                action: 'Προσθήκη Αρχείου',
                timestamp: new Date().toISOString(),
                details: `Το αρχείο "${file.name}" προστέθηκε στο στάδιο "${stage.title}".`
            });
        }
    });
    
    if (!fileAdded) return false;

    // We no longer need to strip calculated properties as they are not stored.
    await updateProjectData(db, projectId, project);
    return true;
}
  
export async function findContextByQuery(db: firestore.Firestore, query: string): Promise<{ projectId: string; interventionMasterId: string; stageId:string; stageTitle:string; projectTitle: string; } | null> {
    const allProjects = await getAllProjects(db);
    if (!allProjects || allProjects.length === 0) return null;

    const lowerCaseQuery = query.toLowerCase();

    for (const project of allProjects) {
        if (project.title.toLowerCase().includes(lowerCaseQuery)) {
            if (project.interventions.length > 0 && project.interventions[0].stages.length > 0) {
                const firstIntervention = project.interventions[0];
                const firstStage = firstIntervention.stages[0];
                return {
                    projectId: project.id,
                    interventionMasterId: firstIntervention.masterId,
                    stageId: firstStage.id,
                    stageTitle: firstStage.title,
                    projectTitle: project.title,
                };
            }
        }
        for (const intervention of project.interventions) {
             if (intervention.interventionCategory.toLowerCase().includes(lowerCaseQuery)) {
                 if (intervention.stages.length > 0) {
                     const firstStage = intervention.stages[0];
                     return {
                        projectId: project.id,
                        interventionMasterId: intervention.masterId,
                        stageId: firstStage.id,
                        stageTitle: firstStage.title,
                        projectTitle: project.title,
                     }
                 }
             }
            for (const stage of intervention.stages) {
                if (stage.title.toLowerCase().includes(lowerCaseQuery)) {
                    return {
                        projectId: project.id,
                        interventionMasterId: intervention.masterId,
                        stageId: stage.id,
                        stageTitle: stage.title,
                        projectTitle: project.title,
                    };
                }
            }
        }
    }
    return null;
}


// =================================================================
// Server Actions
// =================================================================

export async function getBatchWorkOrderData(projectIds: string[]): Promise<{ projects: Project[], contacts: Contact[] }> {
    const db = getAdminDb();
    
    const [allContacts, resolvedProjects] = await Promise.all([
        getContactsData(db),
        getProjectsByIds(db, projectIds),
    ]);

    const clientSideProjects = resolvedProjects.map(p => calculateClientProjectMetrics(p, true));

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
