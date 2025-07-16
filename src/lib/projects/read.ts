
import type { Project } from '@/types';
import { firestore } from "firebase-admin";
import { processProject } from './serialize';

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
    const snapshot = await db.collection('projects').orderBy('title', 'asc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(processProject);
};
