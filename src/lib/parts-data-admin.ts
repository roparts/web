
"use server";

import { revalidatePath } from 'next/cache';
import { adminDb } from './firebase/admin';
import type { Part } from './types';
import { deleteImageAction } from '@/app/actions';

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
        const docRef = adminDb.collection(PARTS_COLLECTION).doc(id);

        // Fetch the old document to check if the image has changed
        const oldDoc = await docRef.get();
        if (oldDoc.exists) {
            const oldData = oldDoc.data() as Part;
            const oldImageFileId = oldData.imageFileId;
            const newImageFileId = dataToUpdate.imageFileId;

            // If there's a new image and an old one to delete
            if (newImageFileId && oldImageFileId && newImageFileId !== oldImageFileId) {
                await deleteImageAction(oldImageFileId);
            }
        }

        await docRef.set(dataToUpdate, { merge: true });
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
        const docRef = adminDb.collection(PARTS_COLLECTION).doc(partId);
        const docSnap = await docRef.get();

        if (docSnap.exists) {
            const partData = docSnap.data() as Part;
            if (partData.imageFileId) {
                await deleteImageAction(partData.imageFileId);
            }
        }
        
        await docRef.delete();
        revalidatePath('/rajababuadmin');
        revalidatePath('/');
    } catch (error) {
        console.error("Error deleting part:", error);
        throw new Error("Failed to delete part.");
    }
}
