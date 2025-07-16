
import type { Project } from '@/types';
import { firestore } from "firebase-admin";

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

export function processProject(projectDoc: firestore.DocumentSnapshot): Project {
    const data = projectDoc.data();
    if (!data) {
        throw new Error(`Project with ID ${projectDoc.id} has no data.`);
    }

    const projectData = {
        id: projectDoc.id,
        ...serializeData(data),
    } as Project;
    
    // Sort interventions safely by creating a new sorted array
    if (projectData.interventions) {
        projectData.interventions = [...(projectData.interventions || [])].sort((a, b) => {
            const nameA = a.interventionSubcategory || a.interventionCategory || '';
            const nameB = b.interventionSubcategory || b.interventionCategory || '';
            return nameA.localeCompare(nameB);
        });
    }

    // Initialize metrics that will be calculated on the client
    projectData.budget = 0;
    projectData.progress = 0;
    projectData.alerts = 0;

    return projectData;
}
