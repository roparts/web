"use server";

import { adminDb } from './firebase/admin';
import type { Part } from './types';
import { unstable_noStore as noStore } from 'next/cache';

const PARTS_COLLECTION = 'parts';

export async function getAllParts(): Promise<Part[]> {
  noStore(); // Opt out of caching for this function
  if (!adminDb) {
     console.log("Admin DB not available in getAllParts");
    return [];
  }
  try {
    const snapshot = await adminDb.collection(PARTS_COLLECTION).get();
    if (snapshot.empty) {
      console.log('No parts found in Firestore.');
      return [];
    }
    const parts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part));
    return parts;
  } catch (error) {
    console.error("Error fetching parts from Firestore:", error);
    // In case of error, you might want to return an empty array or handle it differently
    return [];
  }
}

export async function getPartById(id: string): Promise<Part | null> {
    noStore();
    if (!adminDb) {
        console.log("Admin DB not available in getPartById");
        return null;
    }
    try {
        const docRef = adminDb.collection(PARTS_COLLECTION).doc(id);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            return { id: docSnap.id, ...docSnap.data() } as Part;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (error) {
        console.error("Error fetching part by ID from Firestore:", error);
        return null;
    }
}
