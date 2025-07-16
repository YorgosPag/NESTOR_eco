

import type { Contact } from '@/types';
import type { Firestore } from 'firebase-admin/firestore';
import { normalizeForSearch } from './text-utils';

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

export const getAllContacts = async (db: Firestore): Promise<Contact[]> => {
    const contactsCollection = db.collection('contacts');
    const snapshot = await contactsCollection.orderBy('lastName', 'asc').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...serializeTimestamps(doc.data())
    } as Contact));
}

export const getPaginatedContacts = async (
    db: Firestore, 
    options: { page: number, limit: number, searchTerm?: string }
): Promise<{ contacts: Contact[], totalCount: number }> => {
    const { page, limit, searchTerm } = options;
    
    // For a robust search, a service like Algolia is recommended.
    // Here, we'll fetch all and filter in memory, which is acceptable for moderate datasets
    // but should be replaced for very large scale. The pagination still helps the client.
    const allContacts = await getAllContacts(db);

    let filteredContacts = allContacts;
    if (searchTerm) {
        const normalizedSearch = normalizeForSearch(searchTerm);
        filteredContacts = allContacts.filter(contact => {
            const contactHaystack = [
                contact.firstName,
                contact.lastName,
                contact.company,
                contact.email,
                contact.role,
                contact.specialty,
                contact.mobilePhone,
                contact.landlinePhone,
                contact.vatNumber
            ].filter(Boolean).join(' ');
            const normalizedHaystack = normalizeForSearch(contactHaystack);
            return normalizedHaystack.includes(normalizedSearch);
        });
    }

    const totalCount = filteredContacts.length;
    const startIndex = (page - 1) * limit;
    const paginatedContacts = filteredContacts.slice(startIndex, startIndex + limit);
    
    return {
        contacts: paginatedContacts,
        totalCount: totalCount,
    };
};

export const getContactById = async (db: Firestore, id: string): Promise<Contact | undefined> => {
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

export const addContact = async (db: Firestore, contact: Omit<Contact, 'id'>): Promise<Contact> => {
    const contactsCollection = db.collection('contacts');
    const docRef = await contactsCollection.add(contact);
    const newContact = await getContactById(db, docRef.id);
    if (!newContact) {
        throw new Error("Failed to create and retrieve contact.");
    }
    return newContact;
}

export const updateContact = async (db: Firestore, id: string, updates: Partial<Omit<Contact, 'id'>>): Promise<boolean> => {
    const contactsCollection = db.collection('contacts');
    try {
        await contactsCollection.doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating contact:", error);
        return false;
    }
}

export const deleteContact = async (db: Firestore, id: string): Promise<boolean> => {
    const contactsCollection = db.collection('contacts');
    try {
        await contactsCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting contact:", error);
        return false;
    }
}
