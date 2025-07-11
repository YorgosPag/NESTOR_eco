
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';

let dbInstance: Firestore | null = null;
let initError: Error | null = null;

function initializeFirebaseAdmin() {
  if (dbInstance || initError) {
    return;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const projectId = process.env.FIREBASE_PROJECT_ID;

    if (!privateKey || !clientEmail || !projectId) {
      const missingVars = [
        !privateKey && 'FIREBASE_PRIVATE_KEY',
        !clientEmail && 'FIREBASE_CLIENT_EMAIL',
        !projectId && 'FIREBASE_PROJECT_ID',
      ].filter(Boolean).join(', ');
      
      throw new Error(`One or more Firebase Admin environment variables are not set: ${missingVars}. Please check your deployment environment configuration.`);
    }

    if (getApps().length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    
    dbInstance = admin.firestore();

  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
    initError = new Error(`FIREBASE_INIT_ERROR: ${error.message}`);
  }
}

export function getAdminDb(): admin.firestore.Firestore {
  if (!dbInstance && !initError) {
    initializeFirebaseAdmin();
  }

  if (initError) {
    throw initError;
  }
  
  if (!dbInstance) {
    // This case should ideally not be reached if initError is handled correctly.
    throw new Error('FIREBASE_INIT_ERROR: Firebase Admin SDK is not initialized. The initialization process might have failed silently.');
  }

  return dbInstance;
}
