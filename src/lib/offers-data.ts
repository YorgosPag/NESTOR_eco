
import type { Offer } from '@/types';
import type { Firestore, Timestamp } from 'firebase-admin/firestore';

// Helper function to convert Firestore Timestamps to ISO strings for client-side compatibility
function serializeOffer(doc: FirebaseFirestore.DocumentSnapshot): Offer {
    const data = doc.data() as any;
    const offer: Offer = {
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
    };
    return offer;
}

export const getOffers = async (db: Firestore): Promise<Offer[]> => {
    const offersCollection = db.collection('offers');
    const snapshot = await offersCollection.orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(serializeOffer);
};

export const getOfferById = async (db: Firestore, id: string): Promise<Offer | undefined> => {
    const doc = await db.collection('offers').doc(id).get();
    if (!doc.exists) {
        return undefined;
    }
    return serializeOffer(doc);
};

export const addOffer = async (db: Firestore, offerData: Omit<Offer, 'id' | 'createdAt'>): Promise<string> => {
    const offerPayload = {
        ...offerData,
        createdAt: Timestamp.now(), // Use Firestore Timestamp for server-side consistency
    };
    const docRef = await db.collection('offers').add(offerPayload);
    return docRef.id;
};

export const updateOffer = async (db: Firestore, id: string, updates: Partial<Omit<Offer, 'id'>>): Promise<boolean> => {
    try {
        await db.collection('offers').doc(id).update(updates);
        return true;
    } catch (error) {
        console.error("Error updating offer:", error);
        return false;
    }
};

export const deleteOffer = async (db: Firestore, id: string): Promise<boolean> => {
    try {
        await db.collection('offers').doc(id).delete();
        return true;
    } catch (error) {
        console.error("Error deleting offer:", error);
        return false;
    }
};
