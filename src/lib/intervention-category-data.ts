
import type { ManagedInterventionCategory } from '@/types';
import type { Firestore } from 'firebase-admin/firestore';

export const getInterventionCategories = async (db: Firestore): Promise<ManagedInterventionCategory[]> => {
    const collection = db.collection('interventionCategories');
    const snapshot = await collection.orderBy('name').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ManagedInterventionCategory));
};

export const addInterventionCategory = async (db: Firestore, category: { name: string }): Promise<string> => {
    const collection = db.collection('interventionCategories');
    const docRef = await collection.add(category);
    return docRef.id;
};

export const updateInterventionCategory = async (db: Firestore, id: string, updates: { name: string }): Promise<boolean> => {
    const collection = db.collection('interventionCategories');
    try {
        await collection.doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating intervention category:", error);
        return false;
    }
};

export const deleteInterventionCategory = async (db: Firestore, id: string): Promise<boolean> => {
    const collection = db.collection('interventionCategories');
    try {
        await collection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting intervention category:", error);
        return false;
    }
};
