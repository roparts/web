
"use server";

import { revalidatePath } from 'next/cache';
import { ddbDocClient, TABLES } from './aws/dynamodb';
import { ScanCommand, PutCommand, DeleteCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import type { Part, Brand, CategoryEntity, AdBanner } from './types';
import { deleteImageAction } from '@/app/actions';

export async function getPartsAdmin(): Promise<Part[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.PARTS,
    });
    const response = await ddbDocClient.send(command);
    const parts = (response.Items as Part[]) || [];
    return parts.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching parts for admin from DynamoDB:", error);
    return [];
  }
}

export async function addPart(partData: Omit<Part, 'id'>): Promise<Part> {
  try {
    const id = crypto.randomUUID();
    const newPart = { ...partData, id };
    const command = new PutCommand({
      TableName: TABLES.PARTS,
      Item: newPart,
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
    revalidatePath('/');
    return newPart;
  } catch (error) {
    console.error("Error adding part to DynamoDB:", error);
    throw new Error("Failed to add part.");
  }
}

export async function updatePart(partData: Part): Promise<Part> {
  try {
    const { id } = partData;

    // Fetch old to handle image deletion
    const getCommand = new GetCommand({
      TableName: TABLES.PARTS,
      Key: { id },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const oldData = oldRes.Item as Part;

    if (oldData) {
      if (partData.imageFileId && oldData.imageFileId && partData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const command = new PutCommand({
      TableName: TABLES.PARTS,
      Item: partData,
    });
    await ddbDocClient.send(command);

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/part/${id}`);
    return partData;
  } catch (error) {
    console.error("Error updating part in DynamoDB:", error);
    throw new Error("Failed to update part.");
  }
}

export async function deletePart(partId: string): Promise<void> {
  try {
    const getCommand = new GetCommand({
      TableName: TABLES.PARTS,
      Key: { id: partId },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const partData = oldRes.Item as Part;

    if (partData?.imageFileId) {
      await deleteImageAction(partData.imageFileId);
    }

    const command = new DeleteCommand({
      TableName: TABLES.PARTS,
      Key: { id: partId },
    });
    await ddbDocClient.send(command);

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting part from DynamoDB:", error);
    throw new Error("Failed to delete part.");
  }
}

// --- Brand Operations ---

export async function getBrandsAdmin(): Promise<Brand[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.BRANDS,
    });
    const response = await ddbDocClient.send(command);
    const brands = (response.Items as Brand[]) || [];
    return brands.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching brands for admin from DynamoDB:", error);
    return [];
  }
}

export async function addBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
  try {
    const id = crypto.randomUUID();
    const newBrand = { ...brandData, id };
    const command = new PutCommand({
      TableName: TABLES.BRANDS,
      Item: newBrand,
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
    return newBrand;
  } catch (error) {
    console.error("Error adding brand to DynamoDB:", error);
    throw new Error("Failed to add brand.");
  }
}

export async function updateBrand(brandData: Brand): Promise<Brand> {
  try {
    const { id } = brandData;
    const getCommand = new GetCommand({
      TableName: TABLES.BRANDS,
      Key: { id },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const oldData = oldRes.Item as Brand;

    if (oldData) {
      if (brandData.imageFileId && oldData.imageFileId && brandData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const command = new PutCommand({
      TableName: TABLES.BRANDS,
      Item: brandData,
    });
    await ddbDocClient.send(command);

    revalidatePath('/admin');
    return brandData;
  } catch (error) {
    console.error("Error updating brand in DynamoDB:", error);
    throw new Error("Failed to update brand.");
  }
}

export async function deleteBrand(brandId: string): Promise<void> {
  try {
    const getCommand = new GetCommand({
      TableName: TABLES.BRANDS,
      Key: { id: brandId },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const brandData = oldRes.Item as Brand;

    if (brandData?.imageFileId) {
      await deleteImageAction(brandData.imageFileId);
    }

    const command = new DeleteCommand({
      TableName: TABLES.BRANDS,
      Key: { id: brandId },
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting brand from DynamoDB:", error);
    throw new Error("Failed to delete brand.");
  }
}

// --- Category Operations ---

export async function getCategoriesAdmin(): Promise<CategoryEntity[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.CATEGORIES,
    });
    const response = await ddbDocClient.send(command);
    const categories = (response.Items as CategoryEntity[]) || [];
    return categories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching categories from DynamoDB:", error);
    return [];
  }
}

export async function addCategory(categoryData: Omit<CategoryEntity, 'id'>): Promise<CategoryEntity> {
  try {
    const id = crypto.randomUUID();
    const newCategory = { ...categoryData, id };
    const command = new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: newCategory,
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
    return newCategory;
  } catch (error) {
    console.error("Error adding category to DynamoDB:", error);
    throw new Error("Failed to add category");
  }
}

export async function updateCategory(categoryData: CategoryEntity): Promise<CategoryEntity> {
  try {
    const command = new PutCommand({
      TableName: TABLES.CATEGORIES,
      Item: categoryData,
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
    return categoryData;
  } catch (error) {
    console.error("Error updating category in DynamoDB:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const command = new DeleteCommand({
      TableName: TABLES.CATEGORIES,
      Key: { id: categoryId },
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting category from DynamoDB:", error);
    throw new Error("Failed to delete category");
  }
}

// --- Banner Operations ---

export async function getBannersAdmin(): Promise<AdBanner[]> {
  try {
    const command = new ScanCommand({
      TableName: TABLES.BANNERS,
    });
    const response = await ddbDocClient.send(command);
    const banners = (response.Items as AdBanner[]) || [];
    return banners.sort((a, b) => (a.order || 0) - (b.order || 0));
  } catch (error) {
    console.error("Error fetching banners from DynamoDB:", error);
    return [];
  }
}

export async function addBanner(bannerData: Omit<AdBanner, 'id'>): Promise<AdBanner> {
  try {
    const id = crypto.randomUUID();
    const newBanner = { ...bannerData, id };
    const command = new PutCommand({
      TableName: TABLES.BANNERS,
      Item: newBanner,
    });
    await ddbDocClient.send(command);
    revalidatePath('/admin');
    revalidatePath('/');
    return newBanner;
  } catch (error) {
    console.error("Error adding banner to DynamoDB:", error);
    throw new Error("Failed to add banner");
  }
}

export async function updateBanner(bannerData: AdBanner): Promise<AdBanner> {
  try {
    const { id } = bannerData;
    const getCommand = new GetCommand({
      TableName: TABLES.BANNERS,
      Key: { id },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const oldData = oldRes.Item as AdBanner;

    if (oldData) {
      if (bannerData.imageFileId && oldData.imageFileId && bannerData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const command = new PutCommand({
      TableName: TABLES.BANNERS,
      Item: bannerData,
    });
    await ddbDocClient.send(command);

    revalidatePath('/admin');
    revalidatePath('/');
    return bannerData;
  } catch (error) {
    console.error("Error updating banner in DynamoDB:", error);
    throw new Error("Failed to update banner");
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  try {
    const getCommand = new GetCommand({
      TableName: TABLES.BANNERS,
      Key: { id: bannerId },
    });
    const oldRes = await ddbDocClient.send(getCommand);
    const data = oldRes.Item as AdBanner;

    if (data?.imageFileId) {
      await deleteImageAction(data.imageFileId);
    }

    const command = new DeleteCommand({
      TableName: TABLES.BANNERS,
      Key: { id: bannerId },
    });
    await ddbDocClient.send(command);

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting banner from DynamoDB:", error);
    throw new Error("Failed to delete banner");
  }
}
