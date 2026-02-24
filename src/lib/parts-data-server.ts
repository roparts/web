
"use server";

import { adminDb } from './firebase/admin';
import type { Part, Brand, AdBanner } from './types';

const PARTS_COLLECTION = 'parts';

export async function getAllParts(): Promise<Part[]> {
  // Caching is now enabled by default. `revalidatePath` in admin actions will handle updates.
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
  // Caching is now enabled by default. `revalidatePath` in admin actions will handle updates.
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


export async function getAllBrands(): Promise<Brand[]> {
  if (!adminDb) {
    console.log("Admin DB not available in getAllBrands");
    return [];
  }
  try {
    const snapshot = await adminDb.collection('brands').orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Brand));
  } catch (error) {
    console.error("Error fetching brands:", error);
    return [];
  }
}

export async function getAllBanners(): Promise<AdBanner[]> {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection('banners').orderBy('order').get();
    if (snapshot.empty) return [];
    const banners = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdBanner));
    return banners.filter(b => b.active);
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}
