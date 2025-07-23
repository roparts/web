// src/lib/firebase/admin.ts
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      // Don't throw an error here, just log it. 
      // The app might be running in an environment where these keys aren't needed (e.g., client-side rendering only)
      // or where they are provided by the hosting service.
      console.log('Firebase Admin SDK not initialized: FIREBASE_SERVICE_ACCOUNT_BASE64 is not defined.');
    } else {
        const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
        const serviceAccount = JSON.parse(serviceAccountJson);

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        });
    }
  } catch (error: any) {
    console.error('Firebase admin initialization error', error.stack);
  }
}

export const adminDb = admin.apps.length ? admin.firestore() : null;
