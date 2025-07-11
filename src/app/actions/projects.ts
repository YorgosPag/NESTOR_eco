
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { Project, ProjectIntervention, Stage, StageStatus, SubIntervention, Contact, Attachment, User } from '@/types';
import { getAdminDb } from "@/lib/firebase-admin";
import { getContacts as getContactsData } from '@/lib/contacts-data';
import { firestore } from "firebase-admin";
import { isPast } from 'date-fns';
import { calculateClientProjectMetrics } from '@/lib/client-utils';

// =================================================================
// Data helpers moved from src/lib/data-helpers.ts
// =================================================================

export const users: User[] = [
    {
      id: "user-1",
      name: "Alice",
      email: "alice@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-1",
      role: "Admin",
    },
    {
      id: "user-2",
      name: "Bob",
      email: "bob@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-2",
      role: "Supplier",
    },
    {
      id: "user-3",
      name: "Charlie",
      email: "charlie@example.com",
      avatar: "https://i.pravatar.cc/150?u=user-3",
      role: "Client",
    },
];


// =================================================================
// Data fetching (formerly from src/lib/data.ts)
// =================================================================

export async function getProjectById(db: firestore.Firestore, id: string): Promise<Project | undefined> {
    const projectsCollection = db.collection('projects');
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    const projectData = { id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string };
    return calculateClientProjectMetrics(projectData);
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
        const calculatedProjects = snapshot.docs.map(doc => 
            calculateClientProjectMetrics({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string })
        );
        projects.push(...calculatedProjects);
    });
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => p !== undefined);
};
  
export async function getAllProjects(db: firestore.Firestore): Promise<Project[]> {
    const projectsCollection = db.collection('projects');
    const snapshot = await projectsCollection.orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string }));
    return projects.map(p => calculateClientProjectMetrics(p));
};
  
async function addProjectData(db: firestore.Firestore, project: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'>) {
    const projectsCollection = db.collection('projects');
    await projectsCollection.add(project);
};
  
async function updateProjectData(db: firestore.Firestore, id: string, updates: Partial<Project>) {
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).update(updates);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
  
async function deleteProjectData(db: firestore.Firestore, id: string): Promise<boolean> {
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
  
export async function updateStageStatus(db: firestore.Firestore, projectId: string, stageId: string, status: StageStatus): Promise<boolean> {
    const project = await getProjectById(db, projectId);
    if (!project) return false;
    
    let stageFound = false;
    project.interventions.forEach(intervention => {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            stageFound = true;
            stage.status = status;
            stage.lastUpdated = new Date().toISOString();
            project.auditLog.unshift({
              id: `log-${Date.now()}`,
              user: users[0],
              action: 'Ενημέρωση Κατάστασης Σταδίου',
              timestamp: new Date().toISOString(),
              details: `Το στάδιο "${stage.title}" στην παρέμβαση "${intervention.interventionCategory}" άλλαξε σε "${status}".`
            });
        }
    });

    if (!stageFound) return false;

    const { progress, alerts, status: projectStatus, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);
    return true;
}
  
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

    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);
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
      maxUnitPrice: 0,
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

    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

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

    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

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
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);
  } catch (error: any) {
    console.error("🔥 ERROR in deleteInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η παρέμβαση διαγράφηκε με επιτυχία.' };
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
    const success = await updateStageStatus(db, projectId, stageId, status);
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
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

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
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

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
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

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

        const { progress, alerts, status, budget, ...projectToUpdate } = project;
        await updateProjectData(db, projectId, projectToUpdate);
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
  const effectiveFormData = formData instanceof FormData ? formData : prevState;

  if (!(effectiveFormData instanceof FormData)) {
    return { success: false, message: 'Μη έγκυρα δεδομένα φόρμας.' };
  }
  
  const validatedFields = MoveSubInterventionSchema.safeParse(Object.fromEntries(effectiveFormData.entries()));
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
    
    const { progress, alerts, status, budget, ...projectToUpdate } = project;
    await updateProjectData(db, projectId, projectToUpdate);

  } catch (error: any) {
    console.error("🔥 ERROR in moveSubInterventionAction:", error);
    return { success: false, message: `Σφάλμα Βάσης Δεδομένων: ${error.message}` };
  }

  revalidatePath(`/projects/${projectId}`);
  return { success: true, message: 'Η σειρά άλλαξε.' };
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
