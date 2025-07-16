
'use server';

import type { Project, Stage, StageStatus } from '@/types';
import { users } from '@/lib/data-helpers';
import { FieldValue, Firestore } from 'firebase-admin/firestore';
import { getProjectById } from './read';

export async function addStageToProject(db: Firestore, data: { projectId: string; interventionMasterId: string; title: string; deadline: string; notes?: string; assigneeContactId?: string; supervisorContactId?: string; }) {
    const { projectId, interventionMasterId, ...stageData } = data;
    const projectRef = db.collection('projects').doc(projectId);

    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error('Project not found');

        const project = projectDoc.data() as Project;
        const interventionIndex = project.interventions.findIndex(i => i.masterId === interventionMasterId);

        if (interventionIndex === -1) throw new Error('Intervention not found');
        
        const newStage: Stage = {
            id: `stage-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: stageData.title,
            status: 'pending',
            deadline: new Date(stageData.deadline).toISOString(),
            lastUpdated: new Date().toISOString(),
            files: [],
            notes: stageData.notes || undefined,
            assigneeContactId: stageData.assigneeContactId && stageData.assigneeContactId !== 'none' ? stageData.assigneeContactId : undefined,
            supervisorContactId: stageData.supervisorContactId && stageData.supervisorContactId !== 'none' ? stageData.supervisorContactId : undefined,
        };

        // Create a new array with the new stage added
        project.interventions[interventionIndex].stages.push(newStage);

        // Update the entire interventions array
        transaction.update(projectRef, {
            interventions: project.interventions,
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0],
                action: 'Προσθήκη Σταδίου',
                timestamp: new Date().toISOString(),
                details: `Προστέθηκε το στάδιο "${newStage.title}" στην παρέμβαση "${project.interventions[interventionIndex].interventionCategory}".`,
            })
        });
    });
}


export async function updateStageInProject(db: Firestore, data: { projectId: string; stageId: string, title: string; deadline: string; notes?: string; assigneeContactId?: string; supervisorContactId?: string; }) {
    const { projectId, stageId, ...stageData } = data;
    const projectRef = db.collection('projects').doc(projectId);

    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error('Project not found');
        
        const project = projectDoc.data() as Project;
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

        transaction.update(projectRef, {
            interventions: project.interventions,
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0],
                action: 'Επεξεργασία Σταδίου',
                timestamp: new Date().toISOString(),
                details: `Επεξεργάστηκε το στάδιο "${stageData.title}" στην παρέμβαση "${interventionTitle}".`,
            })
        });
    });
}

export async function deleteStageFromProject(db: Firestore, data: { projectId: string; stageId: string }) {
    const { projectId, stageId } = data;
    const projectRef = db.collection('projects').doc(projectId);

    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error('Project not found');

        const project = projectDoc.data() as Project;
        let stageTitle = '';
        let interventionTitle = '';

        project.interventions.forEach(intervention => {
            const stageIndex = intervention.stages.findIndex(s => s.id === stageId);
            if (stageIndex !== -1) {
                stageTitle = intervention.stages[stageIndex].title;
                interventionTitle = intervention.interventionCategory;
                intervention.stages.splice(stageIndex, 1);
            }
        });

        if (!stageTitle) throw new Error('Stage not found');

        transaction.update(projectRef, {
            interventions: project.interventions,
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0],
                action: 'Διαγραφή Σταδίου',
                timestamp: new Date().toISOString(),
                details: `Διαγράφηκε το στάδιο "${stageTitle}" από την παρέμβαση "${interventionTitle}".`,
            })
        });
    });
}
 
export async function moveStageInProject(db: Firestore, data: { projectId: string; interventionMasterId: string; stageId: string; direction: 'up' | 'down' }) {
    const { projectId, interventionMasterId, stageId, direction } = data;
    const projectRef = db.collection('projects').doc(projectId);
    
    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error('Project not found');

        const project = projectDoc.data() as Project;
        const intervention = project.interventions.find(i => i.masterId === interventionMasterId);
        if (!intervention) throw new Error('Intervention not found');
        
        const stages = intervention.stages;
        const fromIndex = stages.findIndex(s => s.id === stageId);
        if (fromIndex === -1) throw new Error('Stage not found');
        
        const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;

        if (toIndex >= 0 && toIndex < stages.length) {
            [stages[fromIndex], stages[toIndex]] = [stages[toIndex], stages[fromIndex]];
            transaction.update(projectRef, { interventions: project.interventions });
            return { success: true };
        } else {
            return { success: false, message: 'Δεν είναι δυνατή η περαιτέρω μετακίνηση.' };
        }
    });
}

export async function updateStageStatus(db: Firestore, projectId: string, stageId: string, status: StageStatus): Promise<boolean> {
    const projectRef = db.collection('projects').doc(projectId);
    
    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) return false;

        const project = projectDoc.data() as Project;
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

        transaction.update(projectRef, {
            interventions: project.interventions,
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0], 
                action: 'Ενημέρωση Κατάστασης Σταδίου',
                timestamp: new Date().toISOString(),
                details: `Η κατάσταση του σταδίου "${stageTitle}" στην παρέμβαση "${interventionTitle}" άλλαξε σε "${status}".`
            })
        });
        return true;
    }).then(success => success).catch(err => {
        console.error("Error updating stage status in transaction:", err);
        return false;
    });
}

export async function logEmailNotificationInProject(db: Firestore, data: { projectId: string; stageId: string; assigneeName: string; }) {
    const { projectId, stageId, assigneeName } = data;
    const projectRef = db.collection('projects').doc(projectId);

    return db.runTransaction(async (transaction) => {
        const projectDoc = await transaction.get(projectRef);
        if (!projectDoc.exists) throw new Error('Project not found');

        const project = projectDoc.data() as Project;
        const lookup = project.interventions.flatMap(i => i.stages.map(s => ({ stage: s, intervention: i }))).find(l => l.stage.id === stageId);
        if (!lookup) throw new Error('Stage not found');

        const { stage, intervention } = lookup;

        transaction.update(projectRef, {
            auditLog: FieldValue.arrayUnion({
                id: `log-${Date.now()}`,
                user: users[0],
                action: 'Αποστολή Email',
                timestamp: new Date().toISOString(),
                details: `Εστάλη ειδοποίηση στον/στην ${assigneeName} για το στάδιο "${stage.title}" της παρέμβασης "${intervention.interventionCategory}".`,
            })
        });
    });
}
