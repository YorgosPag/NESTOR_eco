
import type { CustomList, CustomListItem } from '@/types';
import type { Firestore } from 'firebase-admin/firestore';

export const getCustomLists = async (db: Firestore): Promise<CustomList[]> => {
    // Order by name to ensure stable, alphabetical sorting which prevents hydration errors.
    const snapshot = await db.collection('customLists').orderBy('name').get();
    if (snapshot.empty) return [];

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as CustomList));
};


export const getAllCustomListItems = async (db: Firestore): Promise<CustomListItem[]> => {
    const snapshot = await db.collection('customListItems').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomListItem));
}

// CRUD for Lists
export const createCustomList = async (db: Firestore, name: string, key?: string): Promise<string> => {
    const collectionRef = db.collection('customLists');
    const data: { name: string; key?: string } = { name };
    if (key) {
        data.key = key;
    }
    const docRef = await collectionRef.add(data);
    return docRef.id;
};


export const updateCustomList = async (db: Firestore, id: string, name: string): Promise<boolean> => {
    // We only update the name, the key remains immutable once set.
    await db.collection('customLists').doc(id).update({ name });
    return true;
};

export const deleteCustomList = async (db: Firestore, id: string): Promise<boolean> => {
    const batch = db.batch();
    const listRef = db.collection('customLists').doc(id);
    batch.delete(listRef);

    const itemsSnapshot = await db.collection('customListItems').where('listId', '==', id).get();
    itemsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    
    await batch.commit();
    return true;
};

// CRUD for List Items
export const createCustomListItem = async (db: Firestore, listId: string, name: string): Promise<string> => {
    const docRef = await db.collection('customListItems').add({ listId, name });
    return docRef.id;
};

export const updateCustomListItem = async (db: Firestore, id: string, name: string): Promise<boolean> => {
    await db.collection('customListItems').doc(id).update({ name });
    return true;
};

export const deleteCustomListItem = async (db: Firestore, id: string): Promise<boolean> => {
    await db.collection('customListItems').doc(id).delete();
    return true;
};
