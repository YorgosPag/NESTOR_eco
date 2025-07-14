
"use server";

import type { Project, Attachment, StageStatus } from '@/types';
import { firestore } from "firebase-admin";
import { users } from '@/lib/data-helpers';

function processProject(projectData: Omit<Project, 'progress' | 'alerts'> & { id: string }): Project {
    let totalProjectBudget = 0;
    
    const interventionsToSort = projectData.interventions || [];

    const sortedInterventions = [...interventionsToSort].sort((a, b) => {
        const nameA = a.interventionSubcategory || a.interventionCategory || '';
        const nameB = b.interventionSubcategory || b.interventionCategory || '';
        return nameA.localeCompare(nameB);
    });

    const interventionsWithCosts = sortedInterventions.map(intervention => {
        const interventionTotalCost = intervention.subInterventions?.reduce((sum, sub) => sum + sub.cost, 0) || 0;
        totalProjectBudget += interventionTotalCost;
        
        const romanNumeralMatch = (intervention.expenseCategory || '').match(/\((I|II|III|IV|V|VI|VII|VIII|IX|X)\)/);
        const romanNumeral = romanNumeralMatch ? ` (${romanNumeralMatch[1]})` : '';

        const subInterventionsWithDisplayCode = (intervention.subInterventions || []).map(sub => ({
            ...sub,
            displayCode: `${sub.subcategoryCode || ''}${romanNumeral}`
        }));

        return {
            ...intervention,
            totalCost: interventionTotalCost,
            subInterventions: subInterventionsWithDisplayCode
        };
    });

    return {
        ...projectData,
        interventions: interventionsWithCosts,
        budget: totalProjectBudget,
        progress: 0, 
        alerts: 0,   
    };
}


export async function getProjectById(db: firestore.Firestore, id: string): Promise<Project | undefined> {
    const doc = await db.collection('projects').doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    const projectData = { id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts'> & { id: string };
    return processProject(projectData);
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
        const projs = snapshot.docs.map(doc => 
            processProject({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts'> & { id: string })
        );
        projects.push(...projs);
    });
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => p !== undefined);
};
 
export async function getAllProjects(db: firestore.Firestore): Promise<Project[]> {
    const snapshot = await db.collection('projects').orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    const projects = snapshot.docs.map(doc => 
        processProject({ id: doc.id, ...doc.data() } as Omit<Project, 'progress' | 'alerts'> & { id: string })
    );
    return projects;
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
