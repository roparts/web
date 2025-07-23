"use server";

import { revalidatePath } from 'next/cache';
import { adminDb } from './firebase/admin';
import type { Part } from './types';

const PARTS_COLLECTION = 'parts';

export async function getPartsAdmin(): Promise<Part[]> {
  if (!adminDb) {
    console.log("Admin DB not available in getPartsAdmin");
    return [];
  }
  try {
    const snapshot = await adminDb.collection(PARTS_COLLECTION).orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Part));
  } catch (error) {
    console.error("Error fetching parts for admin:", error);
    return [];
  }
}

export async function addPart(partData: Omit<Part, 'id'>): Promise<Part> {
  if (!adminDb) {
    throw new Error("Admin DB not available. Cannot add part.");
  }
  try {
    const docRef = await adminDb.collection(PARTS_COLLECTION).add(partData);
    revalidatePath('/rajababuadmin');
    revalidatePath('/');
    return { ...partData, id: docRef.id };
  } catch (error) {
    console.error("Error adding part:", error);
    throw new Error("Failed to add part.");
  }
}

export async function updatePart(partData: Part): Promise<Part> {
    if (!adminDb) {
    throw new Error("Admin DB not available. Cannot update part.");
  }
  try {
    const { id, ...dataToUpdate } = partData;
    await adminDb.collection(PARTS_COLLECTION).doc(id).set(dataToUpdate, { merge: true });
    revalidatePath('/rajababuadmin');
    revalidatePath('/');
    revalidatePath(`/part/${id}`);
    return partData;
  } catch (error) {
    console.error("Error updating part:", error);
    throw new Error("Failed to update part.");
  }
}

export async function deletePart(partId: string): Promise<void> {
    if (!adminDb) {
    throw new Error("Admin DB not available. Cannot delete part.");
  }
  try {
    await adminDb.collection(PARTS_COLLECTION).doc(partId).delete();
    revalidatePath('/rajababuadmin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting part:", error);
    throw new Error("Failed to delete part.");
  }
}
