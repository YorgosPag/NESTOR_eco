
import admin from 'firebase-admin';
import type { Firestore } from 'firebase-admin/firestore';
import { getApps } from 'firebase-admin/app';

// This acts as a singleton cache for the initialized instance or the initialization error.
let dbInstance: Firestore | null = null;
let initError: Error | null = null;

/**
 * Initializes the Firebase Admin SDK. This function is now designed to be called only when
 * the database is first requested, preventing crashes on module load.
 */
function initializeFirebaseAdmin() {
  // Prevent re-initialization if already attempted
  if (dbInstance || initError) {
    return;
  }

  try {
    if (getApps().length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID;

      // A single, clear check for all required environment variables.
      if (!privateKey || !clientEmail || !projectId) {
        const missingVars = [
          !privateKey && 'FIREBASE_PRIVATE_KEY',
          !clientEmail && 'FIREBASE_CLIENT_EMAIL',
          !projectId && 'FIREBASE_PROJECT_ID'
        ].filter(Boolean).join(', ');
        
        // This is a configuration error, so we throw a specific, identifiable error.
        throw new Error(`One or more Firebase Admin environment variables are not set: ${missingVars}. Please set them in your deployment environment (e.g., Netlify).`);
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          // The private key from environment variables often has escaped newlines (\n).
          // We need to replace them with actual newline characters for the SDK to parse it correctly.
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
    }
    // On success, cache the Firestore instance.
    dbInstance = admin.firestore();
  } catch (error: any) {
    // On failure, log the error for debugging on the server and cache the error to be thrown later.
    console.error('Firebase Admin Initialization Error:', error.message);
    // We create a new error with a specific prefix so our UI can identify it.
    initError = new Error(`FIREBASE_INIT_ERROR: ${error.message}`);
  }
}

/**
 * Lazily initializes Firebase Admin and returns the Firestore admin instance.
 * If initialization has already failed, it will throw the cached error.
 * This function is safe to call multiple times as it uses a cached instance.
 * @returns The Firestore admin instance.
 * @throws An error if Firebase Admin SDK initialization failed, allowing Next.js error boundaries to catch it.
 */
export function getAdminDb(): admin.firestore.Firestore {
  // Initialize only if it hasn't been attempted yet.
  if (!dbInstance && !initError) {
    initializeFirebaseAdmin();
  }

  // If initialization resulted in an error, throw it. This will be caught
  // by the Next.js error boundary (`error.tsx`).
  if (initError) {
    throw initError;
  }
  
  // This case should not be reached with the current logic, but it's a safeguard.
  if (!dbInstance) {
    throw new Error('FIREBASE_INIT_ERROR: Firebase Admin SDK is not initialized. The initialization process might have failed silently.');
  }

  // Return the successfully initialized and cached db instance.
  return dbInstance;
}
