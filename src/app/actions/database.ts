
"use server";

import { revalidatePath } from 'next/cache';
import { getAdminDb } from "@/lib/firebase-admin";
import { users } from '@/lib/data-helpers';
import { masterInterventionsData, contactsData } from '@/lib/mock-data';
import type { Contact, MasterIntervention, Project } from '@/types';

// Stages for Project 1 (On Track)
const project1_intervention1_stages: Stage[] = [
    { id: 'p1i1s1', title: 'Έγκριση Προσφοράς', status: 'completed', deadline: new Date(Date.now() - 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Ιωάννης Παπαδόπουλος' },
    { id: 'p1i1s2', title: 'Τεχνική Μελέτη Κουφωμάτων', status: 'completed', deadline: new Date(Date.now() - 15 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Γιώργος Τεχνικός' },
    { id: 'p1i1s3', title: 'Παραγγελία Κουφωμάτων', status: 'in progress', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Μαρία Προμηθεύτρια' },
    { id: 'p1i1s4', title: 'Τοποθέτηση', status: 'pending', deadline: new Date(Date.now() + 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
];

const project1_intervention2_stages: Stage[] = [
    { id: 'p1i2s1', title: 'Μελέτη Θερμομόνωσης', status: 'completed', deadline: new Date(Date.now() - 20 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Γιώργος Τεχνικός' },
    { id: 'p1i2s2', title: 'Εφαρμογή Κελύφους', status: 'pending', deadline: new Date(Date.now() + 45 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Κώστας Μάστορας' },
];

const proj1Interventions: ProjectIntervention[] = [
    {
        masterId: "dummy-id-1",
        expenseCategory: "Κουφώματα (I)",
        interventionCategory: "Κουφώματα",
        interventionSubcategory: "Αντικατάσταση Κουφωμάτων",
        quantity: 20,
        totalCost: 6400,
        stages: project1_intervention1_stages,
        subInterventions: [
            { id: 'sub2', subcategoryCode: '1.Γ2', description: 'Πλαίσιο PVC με υαλοπίνακα - Εξωστόθυρα (U < 2,0)', cost: 2867.74 },
            { id: 'sub1', subcategoryCode: '1.Γ1', description: 'Πλαίσιο PVC με υαλοπίνακα - Παράθυρο (U < 2,0)', cost: 75.00 },
            { id: 'sub3', subcategoryCode: '1.Ε1', description: 'Εξωτερικό προστατευτικό φύλλο (σύστημα Κουτί–Ρολό, ή Εξώφυλλο)', cost: 1638.71 },
        ]
    },
    { masterId: "dummy-id-2", expenseCategory: "Θερμομόνωση (II)", interventionCategory: "Θερμομόνωση", interventionSubcategory: "Εξωτερική Θερμομόνωση (Κέλυφος)", quantity: 120, totalCost: 7800, stages: project1_intervention2_stages },
];


// Stages for Project 2 (Delayed)
const project2_intervention1_stages: Stage[] = [
    { id: 'p2i1s1', title: 'Υποβολή Αίτησης', status: 'completed', deadline: new Date(Date.now() - 60 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: 'p2i1s2', title: 'Έγκριση Δανείου', status: 'completed', deadline: new Date(Date.now() - 45 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
    { id: 'p2i1s3', title: 'Μελέτη Αντλίας Θερμότητας', status: 'in progress', deadline: new Date(Date.now() - 5 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 15 * 86400000).toISOString(), notes: 'Καθυστέρηση στην παράδοση των σχεδίων από τον μηχανικό.', assigneeContactId: 'Κώστας Μάστορας', files: [] },
    { id: 'p2i1s4', title: 'Εγκατάσταση & Πληρωμή', status: 'pending', deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Νίκος Λογιστής' },
];

const proj2Interventions: ProjectIntervention[] = [
    { masterId: "dummy-id-3", expenseCategory: "Συστήματα Θέρμανσης-Ψύξης (III)", interventionCategory: "Συστήματα Θέρμανσης-Ψύξης", interventionSubcategory: "Αντλία Θερμότητας", quantity: 10, totalCost: 9500, stages: project2_intervention1_stages },
];

// Stages for Project 3 (Completed)
const project3_intervention1_stages: Stage[] = [
    { id: 'p3i1s1', title: 'Παραγγελία Φ/Β', status: 'completed', deadline: new Date(Date.now() - 90 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 85 * 86400000).toISOString(), files: [] },
    { id: 'p3i1s2', title: 'Διαδικασίες ΔΕΔΔΗΕ', status: 'completed', deadline: new Date(Date.now() - 60 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 55 * 86400000).toISOString(), files: [] },
    { id: 'p3i1s3', title: 'Εγκατάσταση & Σύνδεση', status: 'completed', deadline: new Date(Date.now() - 30 * 86400000).toISOString(), lastUpdated: new Date(Date.now() - 25 * 86400000).toISOString(), files: [] },
];

const proj3Interventions: ProjectIntervention[] = [
    { masterId: "dummy-id-5", expenseCategory: "Λοιπές Παρεμβάσεις (V)", interventionCategory: "Λοιπές Παρεμβάσεις", interventionSubcategory: "Φωτοβολταϊκό Σύστημα", quantity: 5, totalCost: 6500, stages: project3_intervention1_stages },
];


const projectsMockData: Omit<Project, 'id' | 'progress' | 'status' | 'alerts' | 'budget'>[] = [
    {
      title: "Ανακαίνιση Μονοκατοικίας στο Μαρούσι",
      applicationNumber: "ΕΞ-2024-001",
      ownerContactId: "Ιωάννης Παπαδόπουλος",
      deadline: "2025-05-30T23:59:59Z",
      interventions: proj1Interventions,
      auditLog: [],
    },
    {
      title: "Ενεργειακή Αναβάθμιση Διαμερίσματος στην Πάτρα",
      applicationNumber: "ΕΞ-2024-002",
      ownerContactId: "Μαρία Γεωργίου",
      deadline: "2025-02-28T23:59:59Z",
      interventions: proj2Interventions,
      auditLog: [],
    },
    {
      title: "Εγκατάσταση Φ/Β σε Επαγγελματικό Χώρο",
      applicationNumber: "ΕΞ-2023-157",
      ownerContactId: "Εταιρεία Α.Ε.",
      deadline: "2024-11-20T23:59:59Z",
      interventions: proj3Interventions,
      auditLog: [],
    },
];

export async function seedDatabaseAction() {
    try {
        const db = getAdminDb();
        const projectsCollection = db.collection('projects');
        const contactsCollection = db.collection('contacts');
        const masterInterventionsCollection = db.collection('masterInterventions');

        const projectsSnapshot = await projectsCollection.limit(1).get();
        if (!projectsSnapshot.empty) {
            return { success: false, error: 'Η βάση δεδομένων έχει ήδη δεδομένα για έργα. Το seeding ακυρώθηκε.' };
        }

        const batch = db.batch();

        // 1. Prepare contacts with IDs in memory
        const seededContacts: Contact[] = contactsData.map(contact => {
            const docRef = contactsCollection.doc();
            const newContact: Contact = { ...contact, id: docRef.id };
            batch.set(docRef, contact); // Set original data without id field
            return newContact;
        });

        // 2. Prepare master interventions with IDs in memory
        const seededMasterInterventions: MasterIntervention[] = [];
        for (const intervention of masterInterventionsData) {
            const docRef = masterInterventionsCollection.doc();
            const newMasterIntervention: MasterIntervention = { ...intervention, id: docRef.id };
            batch.set(docRef, intervention);
            seededMasterInterventions.push(newMasterIntervention);
        }

        // 3. Prepare projects using the in-memory data with IDs
        projectsMockData.forEach(project => {
            const docRef = projectsCollection.doc();
            const { ownerContactId, ...restOfProject } = project;
            const ownerContact = seededContacts.find(c => `${c.firstName} ${c.lastName}`.trim() === ownerContactId);
            
            if (!ownerContact) {
                console.warn(`Could not find owner contact for project "${project.title}": ${ownerContactId}`);
            }

            const updatedInterventions = project.interventions.map(inter => {
                const master = seededMasterInterventions.find(mi => mi.code === inter.code);
                if (!master) {
                    console.warn(`Could not find master intervention for project "${project.title}" with code: ${inter.code}`);
                }
                return {
                    ...inter,
                    masterId: master?.id || "unknown-" + Math.random().toString(36).substring(2, 7),
                    stages: inter.stages.map(stage => {
                        const { assigneeContactId, ...restOfStage } = stage;
                        const assignee = assigneeContactId 
                            ? seededContacts.find(c => `${c.firstName} ${c.lastName}`.trim() === assigneeContactId) 
                            : undefined;
                        
                        const finalStage = {
                           ...restOfStage,
                           files: restOfStage.files || [],
                           ...(assignee && { assigneeContactId: assignee.id }),
                        };

                        if (assignee?.id) {
                            finalStage.assigneeContactId = assignee.id;
                        }

                        return finalStage;
                    })
                };
            });
            
            const newProject = {
                ...restOfProject,
                ...(ownerContact && { ownerContactId: ownerContact.id }),
                interventions: updatedInterventions,
            };

            batch.set(docRef, newProject);
        });
        
        // 4. Commit everything in one batch
        await batch.commit();

        revalidatePath('/');
        return { success: true, message: 'Η βάση δεδομένων αρχικοποιήθηκε με επιτυχία.' };

    } catch (error: any) {
        console.error("🔥 ERROR in seedDatabaseAction:", error);
        return { success: false, error: `Η αρχικοποίηση απέτυχε: ${error.message}` };
    }
}
