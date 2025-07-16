
"use server";

import { revalidatePath } from 'next/cache';
import { getAdminDb } from "@/lib/firebase-admin";
import { users } from '@/lib/data-helpers';
import type { Contact, MasterIntervention, Project, ProjectIntervention, Stage } from '@/types';

// Mock Data for Seeding
const contactsData: Omit<Contact, 'id'>[] = [
    { firstName: 'Γιώργος', lastName: 'Τεχνικός', email: 'g.technikos@example.com', mobilePhone: '6971234567', role: 'Τεχνίτης', specialty: 'Ηλεκτρολόγος Μηχανικός' },
    { firstName: 'Μαρία', lastName: 'Προμηθεύτρια', email: 'm.promitheutria@materials.com', mobilePhone: '6987654321', role: 'Προμηθευτής', specialty: 'Κουφώματα & Μονωτικά' },
    { firstName: 'Νίκος', lastName: 'Λογιστής', email: 'nikos.logistis@accountants.gr', role: 'Λογιστήριο', specialty: 'Φοροτεχνικός' },
    { firstName: 'Ιωάννης', lastName: 'Παπαδόπουλος', email: 'ioannis.p@gmail.com', mobilePhone: '6944444444', role: 'Πελάτης' },
    { firstName: 'Μαρία', lastName: 'Γεωργίου', email: 'maria.g@yahoo.com', mobilePhone: '6933333333', role: 'Πελάτης' },
    { firstName: 'Εταιρεία', lastName: 'Α.Ε.', email: 'info@etaireia.gr', role: 'Πελάτης', company: 'Hellenic Business Corp.' },
    { firstName: 'Κώστας', lastName: 'Μάστορας', email: 'k.mastoras@workers.com', mobilePhone: '6911111111', role: 'Τεχνίτης', specialty: 'Υδραυλικός/Εγκαταστάτης Θέρμανσης' },
];

const masterInterventionsData: Omit<MasterIntervention, 'id'>[] = [
    { code: "1.A", expenseCategory: "Κουφώματα (I)", interventionCategory: "Κουφώματα", interventionSubcategory: "Αντικατάσταση Κουφωμάτων", unit: "€/m²", maxUnitPrice: 320, maxAmount: 10000 },
    { code: "2.A", expenseCategory: "Θερμομόνωση (II)", interventionCategory: "Θερμομόνωση", interventionSubcategory: "Εξωτερική Θερμομόνωση (Κέλυφος)", unit: "€/m²", maxUnitPrice: 65, maxAmount: 8000 },
    { code: "3.A", expenseCategory: "Συστήματα Θέρμανσης-Ψύξης (III)", interventionCategory: "Συστήματα Θέρμανσης-Ψύξης", interventionSubcategory: "Αντλία Θερμότητας", unit: "€/kW", maxUnitPrice: 950, maxAmount: 12000 },
    { code: "4.A", expenseCategory: "ΖΝΧ (IV)", interventionCategory: "ΖΝΧ", interventionSubcategory: "Ηλιακός θερμοσίφωνας", unit: "€/μονάδα", maxUnitPrice: 1800, maxAmount: 2000 },
    { code: "5.A", expenseCategory: "Λοιπές Παρεμβάσεις (V)", interventionCategory: "Λοιπές Παρεμβάσεις", interventionSubcategory: "Φωτοβολταϊκό Σύστημα", unit: "€/kW", maxUnitPrice: 1300, maxAmount: 15000 },
];

const project1_intervention1_stages: Stage[] = [
    { id: 'p1i1s1', title: 'Έγκριση Προσφοράς', status: 'completed', deadline: new Date(Date.now() - 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Ιωάννης Παπαδόπουλος' },
    { id: 'p1i1s2', title: 'Τεχνική Μελέτη Κουφωμάτων', status: 'completed', deadline: new Date(Date.now() - 15 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Γιώργος Τεχνικός' },
    { id: 'p1i1s3', title: 'Παραγγελία Κουφωμάτων', status: 'in progress', deadline: new Date(Date.now() + 5 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [], assigneeContactId: 'Μαρία Προμηθεύτρια' },
    { id: 'p1i1s4', title: 'Τοποθέτηση', status: 'pending', deadline: new Date(Date.now() + 30 * 86400000).toISOString(), lastUpdated: new Date().toISOString(), files: [] },
];
const projectsMockData: Omit<Project, 'id' | 'progress' | 'status' | 'alerts' | 'budget'>[] = [
    { title: "Ανακαίνιση Μονοκατοικίας στο Μαρούσι", applicationNumber: "ΕΞ-2024-001", ownerContactId: "Ιωάννης Παπαδόπουλος", deadline: "2025-05-30T23:59:59Z", interventions: [{ masterId: "dummy-id-1", expenseCategory: "Κουφώματα (I)", interventionCategory: "Κουφώματα", interventionSubcategory: "Αντικατάσταση Κουφωμάτων", quantity: 20, totalCost: 6400, stages: project1_intervention1_stages }], auditLog: [] },
    { title: "Ενεργειακή Αναβάθμιση Διαμερίσματος στην Πάτρα", applicationNumber: "ΕΞ-2024-002", ownerContactId: "Μαρία Γεωργίου", deadline: "2025-02-28T23:59:59Z", interventions: [{ masterId: "dummy-id-3", expenseCategory: "Συστήματα Θέρμανσης-Ψύξης (III)", interventionCategory: "Συστήματα Θέρμανσης-Ψύξης", interventionSubcategory: "Αντλία Θερμότητας", quantity: 10, totalCost: 9500, stages: [] }], auditLog: [] },
    { title: "Εγκατάσταση Φ/Β σε Επαγγελματικό Χώρο", applicationNumber: "ΕΞ-2023-157", ownerContactId: "Εταιρεία Α.Ε.", deadline: "2024-11-20T23:59:59Z", interventions: [{ masterId: "dummy-id-5", expenseCategory: "Λοιπές Παρεμβάσεις (V)", interventionCategory: "Λοιπές Παρεμβάσεις", interventionSubcategory: "Φωτοβολταϊκό Σύστημα", quantity: 5, totalCost: 6500, stages: [] }], auditLog: [] },
];
// End of Mock Data

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

        const seededContacts: Contact[] = contactsData.map(contact => {
            const docRef = contactsCollection.doc();
            batch.set(docRef, contact);
            return { ...contact, id: docRef.id };
        });

        const seededMasterInterventions: MasterIntervention[] = masterInterventionsData.map(intervention => {
            const docRef = masterInterventionsCollection.doc();
            batch.set(docRef, intervention);
            return { ...intervention, id: docRef.id };
        });

        projectsMockData.forEach(project => {
            const docRef = projectsCollection.doc();
            const ownerContact = seededContacts.find(c => `${c.firstName} ${c.lastName}`.trim() === project.ownerContactId);
            
            if (!ownerContact) console.warn(`Could not find owner for project: ${project.title}`);

            const updatedInterventions = project.interventions.map(inter => {
                const updatedStages = inter.stages.map(stage => {
                    const assignee = seededContacts.find(c => `${c.firstName} ${c.lastName}`.trim() === stage.assigneeContactId);
                    return { ...stage, assigneeContactId: assignee?.id };
                });
                return { ...inter, stages: updatedStages };
            });

            const newProject = { ...project, ownerContactId: ownerContact?.id, interventions: updatedInterventions };
            batch.set(docRef, newProject);
        });
        
        await batch.commit();

        revalidatePath('/');
        return { success: true, message: 'Η βάση δεδομένων αρχικοποιήθηκε με επιτυχία.' };

    } catch (error: any) {
        console.error("🔥 ERROR in seedDatabaseAction:", error);
        return { success: false, error: `Η αρχικοποίηση απέτυχε: ${error.message}` };
    }
}
