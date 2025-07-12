
import type { Trigger, ExpenseCategory } from '@/types';
import type { Firestore } from 'firebase-admin/firestore';

export const getTriggers = async (db: Firestore): Promise<Trigger[]> => {
    const triggersCollection = db.collection('triggers');
    const snapshot = await triggersCollection.orderBy('name').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Trigger));
};

export const addTrigger = async (db: Firestore, trigger: Omit<Trigger, 'id'>): Promise<string> => {
    const triggersCollection = db.collection('triggers');
    const docRef = await triggersCollection.add(trigger);
    return docRef.id;
};

export const updateTrigger = async (db: Firestore, id: string, updates: Partial<Omit<Trigger, 'id'>>): Promise<boolean> => {
    const triggersCollection = db.collection('triggers');
    try {
        await triggersCollection.doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating trigger:", error);
        return false;
    }
};

export const deleteTrigger = async (db: Firestore, id: string): Promise<boolean> => {
    const triggersCollection = db.collection('triggers');
    try {
        await triggersCollection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting trigger:", error);
        return false;
    }
};
