
import type { MasterIntervention } from '@/types';
import type { Firestore } from 'firebase-admin/firestore';

export async function getMasterInterventions(db: Firestore): Promise<MasterIntervention[]> {
  const collection = db.collection('masterInterventions');
  const snapshot = await collection.orderBy('interventionCategory').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterIntervention));
}

export async function getMasterInterventionById(db: Firestore, id: string): Promise<MasterIntervention | null> {
    const collection = db.collection('masterInterventions');
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as MasterIntervention;
}

export async function addMasterIntervention(db: Firestore, data: Omit<MasterIntervention, 'id'>): Promise<boolean> {
    const collection = db.collection('masterInterventions');
    try {
        await collection.add(data);
        return true;
    } catch (error) {
        console.error("Error adding master intervention:", error);
        return false;
    }
}

export async function updateMasterIntervention(db: Firestore, id: string, data: Partial<Omit<MasterIntervention, 'id'>>): Promise<boolean> {
    const collection = db.collection('masterInterventions');
    try {
        await collection.doc(id).update(data);
        return true;
    } catch (error) {
        console.error("Error updating master intervention:", error);
        return false;
    }
}

export async function deleteMasterIntervention(db: Firestore, id: string): Promise<boolean> {
    const collection = db.collection('masterInterventions');
    try {
        await collection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting master intervention:", error);
        return false;
    }
}
