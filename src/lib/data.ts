
import type {
    Project,
    User,
    Stage,
    StageStatus,
    Attachment,
  } from "@/types";
import type { Firestore } from 'firebase-admin/firestore';
import { firestore } from "firebase-admin";
import { isPast } from 'date-fns';

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

// This function is now the single source of truth for calculating project metrics.
// It can be run on server or client. `isClient` flag handles time-sensitive data.
function calculateProjectMetrics(project: Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string }, isClient: boolean = false): Project {
    if (!project || !project.interventions) {
        return project as Project;
    }

    let totalStages = 0;
    let completedStages = 0;
    let overdueStages = 0;

    project.interventions.forEach(intervention => {
        if (intervention.stages) {
            totalStages += intervention.stages.length;
            intervention.stages.forEach(stage => {
                if (stage.status === 'completed') {
                    completedStages++;
                } else if (isClient && stage.status !== 'failed') {
                    // Overdue calculation is time-sensitive and should only run on the client.
                    if (isPast(new Date(stage.deadline))) {
                        overdueStages++;
                    }
                }
            });
        }
    });

    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    
    let status = project.status;
    if (status !== 'Quotation' && status !== 'Completed') {
         if (progress === 100 && totalStages > 0) {
            status = 'Completed';
        } else if (isClient && overdueStages > 0) {
            status = 'Delayed';
        } else {
            status = 'On Track';
        }
    }

    const sortedInterventions = [...project.interventions].sort((a, b) => 
        (a.interventionSubcategory || a.interventionCategory).localeCompare(b.interventionSubcategory || b.interventionCategory)
    );
    
    let totalProjectBudget = 0;
    const interventionsWithRecalculatedCosts = sortedInterventions.map(intervention => {
        const interventionTotalCost = intervention.subInterventions?.reduce((sum, sub) => sum + sub.cost, 0) || 0;
        totalProjectBudget += interventionTotalCost;
        
        // **THIS IS THE FIX**: Combine the code with the roman numeral here, at the data source.
        const romanNumeralMatch = (intervention.expenseCategory || '').match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
        const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';

        const updatedSubInterventions = intervention.subInterventions?.map(sub => ({
            ...sub,
            displayCode: `${sub.subcategoryCode}${romanNumeral}`
        }));

        return {
            ...intervention,
            totalCost: interventionTotalCost,
            subInterventions: updatedSubInterventions
        };
    });

    return {
        ...project,
        interventions: interventionsWithRecalculatedCosts,
        budget: totalProjectBudget,
        progress,
        status,
        alerts: overdueStages,
    };
}

export const getProjectById = async (db: Firestore, id: string): Promise<Project | undefined> => {
    const projectsCollection = db.collection('projects');
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    const projectData = { id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string };
    return calculateProjectMetrics(projectData);
};

export const getProjectsByIds = async (db: Firestore, ids: string[]): Promise<Project[]> => {
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
            calculateProjectMetrics({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string })
        );
        projects.push(...calculatedProjects);
    });
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => p !== undefined);
};
  
export const getAllProjects = async (db: Firestore): Promise<Project[]> => {
    const projectsCollection = db.collection('projects');
    const snapshot = await projectsCollection.orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts' | 'budget'> & { id: string }));
    return projects.map(p => calculateProjectMetrics(p));
};
  
export const addProject = async (db: Firestore, project: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'>) => {
    const projectsCollection = db.collection('projects');
    await projectsCollection.add(project);
};
  
export const updateProject = async (db: Firestore, id: string, updates: Partial<Project>) => {
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).update(updates);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
  
export const deleteProject = async (db: Firestore, id: string): Promise<boolean> => {
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
};
  
export const findInterventionAndStage = async (db: Firestore, projectId: string, stageId: string) => {
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
  
export const updateStageStatus = async (db: Firestore, projectId: string, stageId: string, status: StageStatus): Promise<boolean> => {
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
    await updateProject(db, projectId, projectToUpdate);
    return true;
}
  
export const addFileToStage = async (db: Firestore, projectId: string, stageId: string, file: Pick<Attachment, 'name' | 'url'>): Promise<boolean> => {
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
    await updateProject(db, projectId, projectToUpdate);
    return true;
}
  
export const findContextByQuery = async (db: Firestore, query: string): Promise<{ projectId: string; interventionMasterId: string; stageId:string; stageTitle:string; projectTitle: string; } | null> => {
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
