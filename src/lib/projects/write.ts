
import type { Project } from '@/types';
import { users } from '@/lib/data-helpers';
import { FieldValue, Firestore } from 'firebase-admin/firestore';

// PROJECT CUD

export async function addProject(db: Firestore, data: { title: string; applicationNumber?: string; ownerContactId: string; deadline?: string; }) {
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
 
export async function updateProject(db: Firestore, id: string, data: Partial<Pick<Project, 'title' | 'applicationNumber' | 'ownerContactId' | 'deadline' | 'status' | 'interventions'>>, logActivation: boolean = false) {
    const projectRef = db.collection('projects').doc(id);
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
        await projectRef.update(updateData);
        return true;
    } catch(error) {
        console.error("Error updating project:", error);
        return false;
    }
};
 
export async function deleteProject(db: Firestore, id: string): Promise<boolean> {
    try {
        await db.collection('projects').doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting project:", error);
        return false;
    }
};
