

"use server";

import type { Project, Attachment, StageStatus } from '@/types';
import { firestore } from "firebase-admin";
import { users } from '@/lib/data-helpers';

// Helper function to safely serialize Firestore Timestamps to ISO strings
function serializeData(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }
    // Handle Firestore Timestamp specifically
    if (typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        // Filter out null/undefined entries from arrays before mapping
        return data.filter(item => item !== null && item !== undefined).map(serializeData);
    }
    if (typeof data === 'object') {
        const serializedData: { [key: string]: any } = {};
        for (const key in data) {
            serializedData[key] = serializeData(data[key]);
        }
        return serializedData;
    }
    return data;
}

function processProject(projectDoc: firestore.DocumentSnapshot): Project {
    const data = projectDoc.data();
    if (!data) {
        throw new Error(`Project with ID ${projectDoc.id} has no data.`);
    }

    const projectData = {
        id: projectDoc.id,
        ...serializeData(data),
    } as Project;

    // Ensure interventions are always an array and sorted
    const interventionsToSort = projectData.interventions || [];
    projectData.interventions = [...interventionsToSort].sort((a, b) => {
        const nameA = a.interventionSubcategory || a.interventionCategory || '';
        const nameB = b.interventionSubcategory || b.interventionCategory || '';
        return nameA.localeCompare(nameB);
    });

    // Initialize client-side calculated fields
    projectData.budget = 0;
    projectData.progress = 0;
    projectData.alerts = 0;

    return projectData;
}

export async function getProjectById(db: firestore.Firestore, id: string): Promise<Project | undefined> {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return processProject(doc);
};

export async function getProjectsByIds(db: firestore.Firestore, ids: string[]): Promise<Project[]> {
    if (!ids || ids.length === 0) {
        return [];
    }
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += 30) {
        chunks.push(ids.slice(i, i + 30));
    }

    const promises = chunks.map(chunk => 
        db.collection('projects').where(firestore.FieldPath.documentId(), 'in', chunk).get()
    );

    const snapshots = await Promise.all(promises);
    const projects: Project[] = [];
    snapshots.forEach(snapshot => {
        const projs = snapshot.docs.map(processProject);
        projects.push(...projs);
    });
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => p !== undefined);
};
 
export async function getAllProjects(db: firestore.Firestore): Promise<Project[]> {
    const snapshot = await db.collection('projects').orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processProject);
};
 
export async function addProjectData(db: firestore.Firestore, project: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'>) {
    await db.collection('projects').add(project);
};
 
export async function updateProjectData(db: firestore.Firestore, id: string, updates: Partial<Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'>>) {
    try {
        await db.collection('projects').doc(id).update(updates);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
 
export async function deleteProjectData(db: firestore.Firestore, id: string): Promise<boolean> {
    try {
        await db.collection('projects').doc(id).delete();
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

    const { progress, alerts, budget, ...projectToUpdate } = project;
    await db.collection('projects').doc(projectId).update(projectToUpdate);
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
        const { progress, alerts, budget, ...projectToUpdate } = project;
        await db.collection('projects').doc(projectId).update(projectToUpdate);
        return true;
    } catch (error) {
        console.error("Error updating stage status:", error);
        return false;
    }
}
