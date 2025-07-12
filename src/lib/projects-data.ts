
"use server";

import type { Project, Attachment, StageStatus } from '@/types';
import { firestore } from "firebase-admin";
import { users } from '@/lib/data-helpers';

export async function getProjectById(db: firestore.Firestore, id: string): Promise<Project | undefined> {
    const projectsCollection = db.collection('projects');
    const doc = await projectsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
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

    await updateProjectData(db, projectId, project);
    return true;
}

export async function updateStageStatus(db: firestore.Firestore, projectId: string, stageId: string, status: StageStatus): Promise<boolean> {
    const project = await getProjectById(db, projectId);
    if (!project) return false;

    let stageUpdated = false;
    let stageTitle = '';
    let interventionTitle = '';

    for (const intervention of project.interventions) {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            stage.status = status;
            stage.lastUpdated = new Date().toISOString();
            stageUpdated = true;
            stageTitle = stage.title;
            interventionTitle = intervention.interventionCategory;
            break;
        }
    }

    if (!stageUpdated) return false;

    project.auditLog.unshift({
        id: `log-${Date.now()}`,
        user: users[0], 
        action: 'Ενημέρωση Κατάστασης Σταδίου',
        timestamp: new Date().toISOString(),
        details: `Η κατάσταση του σταδίου "${stageTitle}" στην παρέμβαση "${interventionTitle}" άλλαξε σε "${status}".`
    });

    try {
        await updateProjectData(db, projectId, project);
        return true;
    } catch (error) {
        console.error("Error updating stage status:", error);
        return false;
    }
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
