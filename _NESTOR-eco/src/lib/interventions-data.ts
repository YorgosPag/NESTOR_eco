
import type { MasterIntervention } from '@/types';
import { getAdminDb } from './firebase-admin';

export async function getMasterInterventions(): Promise<MasterIntervention[]> {
  const db = getAdminDb();
  const collection = db.collection('masterInterventions');
  const snapshot = await collection.orderBy('interventionCategory').get();
  if (snapshot.empty) {
    return [];
  }
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MasterIntervention));
}

export async function getMasterInterventionById(id: string): Promise<MasterIntervention | null> {
    const db = getAdminDb();
    const collection = db.collection('masterInterventions');
    const doc = await collection.doc(id).get();
    if (!doc.exists) {
        return null;
    }
    return { id: doc.id, ...doc.data() } as MasterIntervention;
}

export async function addMasterIntervention(id: string, data: Omit<MasterIntervention, 'id'>): Promise<boolean> {
    const db = getAdminDb();
    const collection = db.collection('masterInterventions');
    try {
        await collection.doc(id).set(data);
        return true;
    } catch (error) {
        console.error("Error adding master intervention:", error);
        return false;
    }
}

export async function updateMasterIntervention(id: string, data: Partial<Omit<MasterIntervention, 'id'>>): Promise<boolean> {
    const db = getAdminDb();
    const collection = db.collection('masterInterventions');
    try {
        await collection.doc(id).update(data);
        return true;
    } catch (error) {
        console.error("Error updating master intervention:", error);
        return false;
    }
}

export async function deleteMasterIntervention(id: string): Promise<boolean> {
    const db = getAdminDb();
    const collection = db.collection('masterInterventions');
    try {
        await collection.doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting master intervention:", error);
        return false;
    }
}
