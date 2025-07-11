
"use server";

import { revalidatePath } from 'next/cache';
import { getAdminDb } from "@/lib/firebase-admin";
import { users } from '@/lib/data';
import { contactsData, masterInterventionsData, projectsMockData } from "@/lib/mock-data";
import type { Contact, MasterIntervention, Project } from '@/types';

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
