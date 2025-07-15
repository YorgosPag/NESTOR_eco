

"use server";

import type { Project, Attachment, Stage, StageStatus, SubIntervention, ProjectIntervention } from '@/types';
import { firestore } from "firebase-admin";
import { users } from '@/lib/data-helpers';
import { FieldValue } from 'firebase-admin/firestore';

// Helper function to safely serialize Firestore Timestamps to ISO strings
function serializeData(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }
    if (typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    if (Array.isArray(data)) {
        return data.filter(item => item !== null && item !== undefined).map(serializeData);
    }
    if (typeof data === 'object' && data.constructor === Object) {
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

    const interventionsToSort = projectData.interventions || [];
    projectData.interventions = [...interventionsToSort].sort((a, b) => {
        const nameA = a.interventionSubcategory || a.interventionCategory || '';
        const nameB = b.interventionSubcategory || b.interventionCategory || '';
        return nameA.localeCompare(nameB);
    });

    projectData.budget = 0;
    projectData.progress = 0;
    projectData.alerts = 0;

    return projectData;
}

// ===============================================
// READ OPERATIONS
// ===============================================

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
    
    return ids.map(id => projects.find(p => p.id === id)).filter((p): p is Project => !!p);
};
 
export async function getAllProjects(db: firestore.Firestore): Promise<Project[]> {
    const snapshot = await db.collection('projects').orderBy('title').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processProject);
};

// ===============================================
// WRITE (CUD) OPERATIONS
// ===============================================

// PROJECT CUD

export async function addProject(db: firestore.Firestore, data: { title: string; applicationNumber?: string; ownerContactId: string; deadline?: string; }) {
    const newProject: Omit<Project, 'id' | 'progress' | 'alerts' | 'budget'> = {
        title: data.title,
        applicationNumber: data.applicationNumber,
        ownerContactId: data.ownerContactId,
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
        status: 'Quotation',
        interventions: [],
        auditLog: [{
            id: `log-${Date.now()}`,
            user: users[0], 
            action: 'Δημιουργία Προσφοράς',
            timestamp: new Date().toISOString(),
            details: `Το έργο "${data.title}" δημιουργήθηκε σε φάση προσφοράς.`
        }],
    };
    await db.collection('projects').add(newProject);
};
 
export async function updateProject(db: firestore.Firestore, id: string, data: Partial<Pick<Project, 'title' | 'applicationNumber' | 'ownerContactId' | 'deadline' | 'status'>>, logActivation: boolean = false) {
    const updateData: { [key: string]: any } = { ...data };
    if (data.deadline) {
        updateData.deadline = data.deadline ? new Date(data.deadline).toISOString() : '';
    }

    if (logActivation) {
        updateData.auditLog = FieldValue.arrayUnion({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Ενεργοποίηση Έργου',
            timestamp: new Date().toISOString(),
            details: 'Η κατάσταση του έργου άλλαξε από "Προσφορά" σε "Εντός Χρονοδιαγράμματος".',
        });
    }

    try {
        await db.collection('projects').doc(id).update(updateData);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
 
export async function deleteProject(db: firestore.Firestore, id: string): Promise<boolean> {
    try {
        await db.collection('projects').doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
};

// INTERVENTION CUD (Handled in interventions-data.ts)


// STAGE CUD

export async function addStageToProject(db: firestore.Firestore, data: { projectId: string; interventionMasterId: string; title: string; deadline: string; notes?: string; assigneeContactId?: string; supervisorContactId?: string; }) {
    const { projectId, interventionMasterId, ...stageData } = data;
    const projectRef = db.collection('projects').doc(projectId);

    const newStage: Stage = {
        id: `stage-${Date.now()}`,
        title: stageData.title,
        status: 'pending',
        deadline: new Date(stageData.deadline).toISOString(),
        lastUpdated: new Date().toISOString(),
        files: [],
        notes: stageData.notes || undefined,
        assigneeContactId: stageData.assigneeContactId && stageData.assigneeContactId !== 'none' ? stageData.assigneeContactId : undefined,
        supervisorContactId: stageData.supervisorContactId && stageData.supervisorContactId !== 'none' ? stageData.supervisorContactId : undefined,
    };
    
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Project not found');

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention) throw new Error('Intervention not found');
    
    intervention.stages.push(newStage);

    await projectRef.update({
        interventions: project.interventions,
        auditLog: FieldValue.arrayUnion({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Προσθήκη Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Προστέθηκε το στάδιο "${newStage.title}" στην παρέμβαση "${intervention.interventionCategory}".`,
        })
    });
}

export async function updateStageInProject(db: firestore.Firestore, data: { projectId: string; stageId: string, title: string; deadline: string; notes?: string; assigneeContactId?: string; supervisorContactId?: string; }) {
    const { projectId, stageId, ...stageData } = data;
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Project not found');

    let interventionTitle = '';
    let stageUpdated = false;

    project.interventions.forEach(intervention => {
        const stage = intervention.stages.find(s => s.id === stageId);
        if (stage) {
            stage.title = stageData.title;
            stage.deadline = new Date(stageData.deadline).toISOString();
            stage.notes = stageData.notes || undefined;
            stage.assigneeContactId = stageData.assigneeContactId && stageData.assigneeContactId !== 'none' ? stageData.assigneeContactId : undefined;
            stage.supervisorContactId = stageData.supervisorContactId && stageData.supervisorContactId !== 'none' ? stageData.supervisorContactId : undefined;
            stage.lastUpdated = new Date().toISOString();
            interventionTitle = intervention.interventionCategory;
            stageUpdated = true;
        }
    });

    if (!stageUpdated) throw new Error('Stage not found');

    await db.collection('projects').doc(projectId).update({
        interventions: project.interventions,
        auditLog: FieldValue.arrayUnion({
             id: `log-${Date.now()}`,
            user: users[0],
            action: 'Επεξεργασία Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Επεξεργάστηκε το στάδιο "${stageData.title}" στην παρέμβαση "${interventionTitle}".`,
        })
    });
}

export async function deleteStageFromProject(db: firestore.Firestore, data: { projectId: string; stageId: string }) {
    const { projectId, stageId } = data;
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Project not found');
    
    let stageTitle = '';
    let interventionTitle = '';
    
    const newInterventions = project.interventions.map(intervention => {
        const stageIndex = intervention.stages.findIndex(s => s.id === stageId);
        if (stageIndex !== -1) {
            stageTitle = intervention.stages[stageIndex].title;
            interventionTitle = intervention.interventionCategory;
            intervention.stages.splice(stageIndex, 1);
        }
        return intervention;
    });

    if (!stageTitle) throw new Error('Stage not found');

    await db.collection('projects').doc(projectId).update({
        interventions: newInterventions,
        auditLog: FieldValue.arrayUnion({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Διαγραφή Σταδίου',
            timestamp: new Date().toISOString(),
            details: `Διαγράφηκε το στάδιο "${stageTitle}" από την παρέμβαση "${interventionTitle}".`,
        })
    });
}
 
export async function moveStageInProject(db: firestore.Firestore, data: { projectId: string; interventionMasterId: string; stageId: string; direction: 'up' | 'down' }) {
    const { projectId, interventionMasterId, stageId, direction } = data;
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Project not found');

    const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
    if (!intervention) throw new Error('Intervention not found');
    
    const stages = intervention.stages;
    const fromIndex = stages.findIndex(s => s.id === stageId);
    if (fromIndex === -1) throw new Error('Stage not found');
    
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex >= 0 && toIndex < stages.length) {
        [stages[fromIndex], stages[toIndex]] = [stages[toIndex], stages[fromIndex]];
    } else {
        return { success: false }; // Indicate that no move was possible
    }
    
    await db.collection('projects').doc(projectId).update({ interventions: project.interventions });
    return { success: true };
}

// OTHER ACTIONS

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

    try {
        const { progress, alerts, budget, ...projectToUpdate } = project;
        await db.collection('projects').doc(projectId).update({
            ...projectToUpdate,
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0], 
                action: 'Ενημέρωση Κατάστασης Σταδίου',
                timestamp: new Date().toISOString(),
                details: `Η κατάσταση του σταδίου "${stageTitle}" στην παρέμβαση "${interventionTitle}" άλλαξε σε "${status}".`
            })
        });
        return true;
    } catch (error) {
        console.error("Error updating stage status:", error);
        return false;
    }
}

export async function logEmailNotificationInProject(db: firestore.Firestore, data: { projectId: string; stageId: string; assigneeName: string; }) {
    const { projectId, stageId, assigneeName } = data;
    const project = await getProjectById(db, projectId);
    if (!project) throw new Error('Project not found');

    const lookup = project.interventions.flatMap(i => i.stages.map(s => ({ stage: s, intervention: i }))).find(l => l.stage.id === stageId);
    if (!lookup) throw new Error('Stage not found');

    const { stage, intervention } = lookup;

    await db.collection('projects').doc(projectId).update({
        auditLog: FieldValue.arrayUnion({
            id: `log-${Date.now()}`,
            user: users[0],
            action: 'Αποστολή Email',
            timestamp: new Date().toISOString(),
            details: `Εστάλη ειδοποίηση στον/στην ${assigneeName} για το στάδιο "${stage.title}" της παρέμβασης "${intervention.interventionCategory}".`,
        })
    });
}
