
import type { Contact } from '@/types';
import { getAdminDb } from './firebase-admin';

// Helper function to convert Firestore Timestamps to ISO strings
function serializeTimestamps(data: any) {
    if (!data) return data;
    const serializedData: { [key: string]: any } = {};
    for (const key in data) {
        const value = data[key];
        // A simple check for Firestore Timestamp-like objects.
        if (value && typeof value.toDate === 'function') {
            serializedData[key] = value.toDate().toISOString();
        } else {
            serializedData[key] = value;
        }
    }
    return serializedData;
}

export const getContacts = async (): Promise<Contact[]> => {
    const db = getAdminDb();
    const contactsCollection = db.collection('contacts');
    const snapshot = await contactsCollection.get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...serializeTimestamps(doc.data())
    } as Contact));
}

export const getContactById = async (id: string): Promise<Contact | undefined> => {
    const db = getAdminDb();
    const contactsCollection = db.collection('contacts');
    const doc = await contactsCollection.doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    const data = doc.data();
    return { 
        id: doc.id, 
        ...serializeTimestamps(data) 
    } as Contact;
}

export const addContact = async (contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const db = getAdminDb();
    const contactsCollection = db.collection('contacts');
    const docRef = await contactsCollection.add(contact);
    const newContact = await getContactById(docRef.id);
    if (!newContact) {
        throw new Error("Failed to create and retrieve contact.");
    }
    return newContact;
}

export const updateContact = async (id: string, updates: Partial<Omit<Contact, 'id'>>): Promise<boolean> => {
    const db = getAdminDb();
    const contactsCollection = db.collection('contacts');
    try {
        await contactsCollection.doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating contact:", error);
        return false;
    }
}

export const deleteContact = async (id: string): Promise<boolean> => {
    const db = getAdminDb();
    const contactsCollection = db.collection('contacts');
    try {
        await contactsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting contact:", error);
        return false;
    }
}
