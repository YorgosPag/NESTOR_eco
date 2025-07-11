
import type {
    Project,
    User,
    Stage,
    StageStatus,
    Attachment,
  } from "@/types";
import { isPast } from 'date-fns';
import { getAdminDb } from './firebase-admin';

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
  
function calculateProjectMetrics(project: Omit<Project, 'progress' | 'status' | 'alerts'> & { id: string }): Project {
    let totalStages = 0;
    let completedStages = 0;
    let overdueStages = 0;

    project.interventions.forEach(intervention => {
        totalStages += intervention.stages.length;
        intervention.stages.forEach(stage => {
            if (stage.status === 'completed') {
                completedStages++;
            } else {
                 if (isPast(new Date(stage.deadline))) {
                    overdueStages++;
                }
            }
        });
    });

    const progress = totalStages > 0 ? Math.round((completedStages / totalStages) * 100) : 0;
    
    let status: Project['status'] = 'On Track';
    if (progress === 100 && totalStages > 0) {
        status = 'Completed';
    } else if (overdueStages > 0) {
        status = 'Delayed';
    }

    return {
        ...project,
        progress,
        status,
        alerts: overdueStages,
    };
}
  
export const getProjectById = async (id: string): Promise<Project | undefined> => {
    const db = getAdminDb();
    const projectsCollection = db.collection('projects');
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    const projectData = { id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'status' | 'alerts'> & { id: string };
    return calculateProjectMetrics(projectData);
};
  
export const getAllProjects = async (): Promise<Project[]> => {
    const db = getAdminDb();
    const projectsCollection = db.collection('projects');
    const snapshot = await projectsCollection.get();
    if (snapshot.empty) {
        return [];
    }
    const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'status' | 'alerts'> & { id: string }));
    return projects.map(calculateProjectMetrics);
};
  
export const addProject = async (project: Omit<Project, 'id' | 'progress' | 'status' | 'alerts'>) => {
    const db = getAdminDb();
    const projectsCollection = db.collection('projects');
    await projectsCollection.add(project);
};
  
export const updateProject = async (id: string, updates: Partial<Project>) => {
    const db = getAdminDb();
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).update(updates);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
  
export const deleteProject = async (id: string): Promise<boolean> => {
    const db = getAdminDb();
    const projectsCollection = db.collection('projects');
    try {
        await projectsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
};
  
export const findInterventionAndStage = async (projectId: string, stageId: string) => {
    const project = await getProjectById(projectId);
    if (!project) return null;

    for (const intervention of project.interventions) {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            return { project, intervention, stage };
        }
    }
    return null;
};
  
export const updateStageStatus = async (projectId: string, stageId: string, status: StageStatus): Promise<boolean> => {
    const project = await getProjectById(projectId);
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

    // We must remove the calculated properties before updating Firestore
    const { progress, alerts, status: projectStatus, ...projectToUpdate } = project;
    await updateProject(projectId, projectToUpdate);
    return true;
}
  
export const addFileToStage = async (projectId: string, stageId: string, file: Pick<Attachment, 'name' | 'url'>): Promise<boolean> => {
    const project = await getProjectById(projectId);
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

    const { progress, alerts, status, ...projectToUpdate } = project;
    await updateProject(projectId, projectToUpdate);
    return true;
}
  
export const findContextByQuery = async (query: string): Promise<{ projectId: string; interventionMasterId: string; stageId:string; stageTitle:string; projectTitle: string; } | null> => {
    const allProjects = await getAllProjects();

    for (const project of allProjects) {
        if (project.title.toLowerCase().includes(query.toLowerCase())) {
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
             if (intervention.interventionCategory.toLowerCase().includes(query.toLowerCase())) {
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
                if (stage.title.toLowerCase().includes(query.toLowerCase())) {
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
