
"use server";

import { revalidatePath } from 'next/cache';
import { adminDb } from './firebase/admin';
import type { Part, Brand, CategoryEntity, AdBanner } from './types';
import { deleteImageAction } from '@/app/actions';

const PARTS_COLLECTION = 'parts';
const BRANDS_COLLECTION = 'brands';

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
    revalidatePath('/admin');
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
    revalidatePath('/admin');
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
    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting part:", error);
    throw new Error("Failed to delete part.");
  }
}

// --- Brand Operations ---

export async function getBrandsAdmin(): Promise<Brand[]> {
  if (!adminDb) {
    console.log("Admin DB not available in getBrandsAdmin");
    return [];
  }
  try {
    const snapshot = await adminDb.collection(BRANDS_COLLECTION).orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Brand));
  } catch (error) {
    console.error("Error fetching brands for admin:", error);
    return [];
  }
}

export async function addBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
  if (!adminDb) {
    throw new Error("Admin DB not available. Cannot add brand.");
  }
  try {
    const docRef = await adminDb.collection(BRANDS_COLLECTION).add(brandData);
    revalidatePath('/admin');
    return { ...brandData, id: docRef.id };
  } catch (error) {
    console.error("Error adding brand:", error);
    throw new Error("Failed to add brand.");
  }
}

export async function updateBrand(brandData: Brand): Promise<Brand> {
  if (!adminDb) {
    throw new Error("Admin DB not available. Cannot update brand.");
  }
  try {
    const { id, ...dataToUpdate } = brandData;
    const docRef = adminDb.collection(BRANDS_COLLECTION).doc(id);

    const oldDoc = await docRef.get();
    if (oldDoc.exists) {
      const oldData = oldDoc.data() as Brand;
      const oldImageFileId = oldData.imageFileId;
      const newImageFileId = dataToUpdate.imageFileId;

      if (newImageFileId && oldImageFileId && newImageFileId !== oldImageFileId) {
        await deleteImageAction(oldImageFileId);
      }
    }

    await docRef.set(dataToUpdate, { merge: true });
    revalidatePath('/admin');
    return brandData;
  } catch (error) {
    console.error("Error updating brand:", error);
    throw new Error("Failed to update brand.");
  }
}

export async function deleteBrand(brandId: string): Promise<void> {
  if (!adminDb) {
    throw new Error("Admin DB not available. Cannot delete brand.");
  }
  try {
    const docRef = adminDb.collection(BRANDS_COLLECTION).doc(brandId);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      const brandData = docSnap.data() as Brand;
      if (brandData.imageFileId) {
        await deleteImageAction(brandData.imageFileId);
      }
    }

    await docRef.delete();
    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting brand:", error);
    throw new Error("Failed to delete brand.");
  }
}
// --- Category Operations ---

const CATEGORIES_COLLECTION = 'categories';

export async function getCategoriesAdmin(): Promise<CategoryEntity[]> {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).orderBy('name').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as CategoryEntity));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function addCategory(categoryData: Omit<CategoryEntity, 'id'>): Promise<CategoryEntity> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    const docRef = await adminDb.collection(CATEGORIES_COLLECTION).add(categoryData);
    revalidatePath('/admin');
    return { ...categoryData, id: docRef.id };
  } catch (error) {
    console.error("Error adding category:", error);
    throw new Error("Failed to add category");
  }
}

export async function updateCategory(categoryData: CategoryEntity): Promise<CategoryEntity> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    const { id, ...data } = categoryData;
    await adminDb.collection(CATEGORIES_COLLECTION).doc(id).set(data, { merge: true });
    revalidatePath('/admin');
    return categoryData;
  } catch (error) {
    console.error("Error updating category:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    await adminDb.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();
    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting category:", error);
    throw new Error("Failed to delete category");
  }
}

// --- Banner Operations ---
const BANNERS_COLLECTION = 'banners';

export async function getBannersAdmin(): Promise<AdBanner[]> {
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection(BANNERS_COLLECTION).orderBy('order').get();
    if (snapshot.empty) return [];
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as AdBanner));
  } catch (error) {
    console.error("Error fetching banners:", error);
    return [];
  }
}

export async function addBanner(bannerData: Omit<AdBanner, 'id'>): Promise<AdBanner> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    const docRef = await adminDb.collection(BANNERS_COLLECTION).add(bannerData);
    revalidatePath('/admin');
    revalidatePath('/');
    return { ...bannerData, id: docRef.id };
  } catch (error) {
    console.error("Error adding banner:", error);
    throw new Error("Failed to add banner");
  }
}

export async function updateBanner(bannerData: AdBanner): Promise<AdBanner> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    const { id, ...data } = bannerData;
    const docRef = adminDb.collection(BANNERS_COLLECTION).doc(id);

    const oldDoc = await docRef.get();
    if (oldDoc.exists) {
      const oldData = oldDoc.data() as AdBanner;
      if (data.imageFileId && oldData.imageFileId && data.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    await docRef.set(data, { merge: true });
    revalidatePath('/admin');
    revalidatePath('/');
    return bannerData;
  } catch (error) {
    console.error("Error updating banner:", error);
    throw new Error("Failed to update banner");
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  if (!adminDb) throw new Error("Admin DB not available");
  try {
    const docRef = adminDb.collection(BANNERS_COLLECTION).doc(bannerId);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
      const data = docSnap.data() as AdBanner;
      if (data.imageFileId) {
        await deleteImageAction(data.imageFileId);
      }
    }
    await docRef.delete();
    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting banner:", error);
    throw new Error("Failed to delete banner");
  }
}
