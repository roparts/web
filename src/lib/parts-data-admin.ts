"use server";

import { revalidatePath } from 'next/cache';
import { supabaseAdmin } from './supabase';
import type { Part, Brand, CategoryEntity, AdBanner } from './types';
import { deleteImageAction } from '@/app/actions';

// Helpers to map database models to client types
function mapPart(dbPart: any): Part {
  return {
    id: dbPart.id,
    name: dbPart.name,
    name_hi: dbPart.name_hi || undefined,
    mainCategory: dbPart.mainCategory,
    subcategory: dbPart.subcategory,
    price: Number(dbPart.price),
    discountPrice: dbPart.discountPrice !== null && dbPart.discountPrice !== undefined ? Number(dbPart.discountPrice) : undefined,
    description: dbPart.description,
    description_hi: dbPart.description_hi || undefined,
    image: dbPart.image,
    imageFileId: dbPart.imageFileId || undefined,
    features: dbPart.features,
    features_hi: dbPart.features_hi || undefined,
    minQuantity: dbPart.minQuantity !== null && dbPart.minQuantity !== undefined ? dbPart.minQuantity : undefined,
    brand: dbPart.brand || undefined,
    brandId: dbPart.brandId || undefined,
    gpd: dbPart.gpd !== null && dbPart.gpd !== undefined ? Number(dbPart.gpd) : undefined,
    voltage: dbPart.voltage || undefined,
    inletOutletSize: dbPart.inletOutletSize || undefined,
    material: dbPart.material || undefined,
    color: dbPart.color || undefined,
  };
}

function mapBrand(dbBrand: any): Brand {
  return {
    id: dbBrand.id,
    name: dbBrand.name,
    image: dbBrand.image || undefined,
    imageFileId: dbBrand.imageFileId || undefined,
    description: dbBrand.description || undefined,
    whatsappNumber: dbBrand.whatsappNumber || undefined,
  };
}

function mapCategory(dbCategory: any): CategoryEntity {
  return {
    id: dbCategory.id,
    name: dbCategory.name,
    type: dbCategory.type as 'main' | 'sub',
    parentId: dbCategory.parentId || undefined,
  };
}

function mapBanner(dbBanner: any): AdBanner {
  return {
    id: dbBanner.id,
    title: dbBanner.title,
    title_hi: dbBanner.title_hi || undefined,
    subtitle: dbBanner.subtitle,
    subtitle_hi: dbBanner.subtitle_hi || undefined,
    badge: dbBanner.badge || undefined,
    badge_hi: dbBanner.badge_hi || undefined,
    image: dbBanner.image,
    imageFileId: dbBanner.imageFileId || undefined,
    link: dbBanner.link || undefined,
    active: dbBanner.active ?? false,
    order: dbBanner.order ?? 0,
  };
}

// --- Part Operations ---

export async function getPartsAdmin(): Promise<Part[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('parts')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching parts for admin from Supabase:", error);
      return [];
    }
    return (data || []).map(mapPart);
  } catch (error) {
    console.error("Error fetching parts for admin from Supabase:", error);
    return [];
  }
}

export async function addPart(partData: Omit<Part, 'id'>): Promise<Part> {
  try {
    const id = crypto.randomUUID();
    const newPart = {
      id,
      sku: id, // Fallback SKU to generated UUID
      name: partData.name,
      name_hi: partData.name_hi || null,
      mainCategory: partData.mainCategory,
      subcategory: partData.subcategory,
      price: partData.price,
      discountPrice: partData.discountPrice !== undefined ? partData.discountPrice : null,
      description: partData.description,
      description_hi: partData.description_hi || null,
      image: partData.image,
      imageFileId: partData.imageFileId || null,
      features: partData.features,
      features_hi: partData.features_hi || null,
      minQuantity: partData.minQuantity !== undefined ? partData.minQuantity : 1,
      brand: partData.brand || null,
      brandId: partData.brandId || null,
      gpd: partData.gpd !== undefined ? partData.gpd : null,
      voltage: partData.voltage || null,
      inletOutletSize: partData.inletOutletSize || null,
      material: partData.material || null,
      color: partData.color || null,
      stock: 50,
    };

    const { data, error } = await supabaseAdmin
      .from('parts')
      .insert([newPart])
      .select()
      .single();

    if (error) {
      console.error("Error adding part to Supabase:", error);
      throw new Error(`Failed to add part: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return mapPart(data);
  } catch (error) {
    console.error("Error adding part to Supabase:", error);
    throw new Error("Failed to add part.");
  }
}

export async function updatePart(partData: Part): Promise<Part> {
  try {
    const { id } = partData;

    // Fetch old record to check image changes
    const { data: oldData, error: getError } = await supabaseAdmin
      .from('parts')
      .select('imageFileId')
      .eq('id', id)
      .maybeSingle();

    if (!getError && oldData) {
      if (partData.imageFileId && oldData.imageFileId && partData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const updatedPart = {
      name: partData.name,
      name_hi: partData.name_hi || null,
      mainCategory: partData.mainCategory,
      subcategory: partData.subcategory,
      price: partData.price,
      discountPrice: partData.discountPrice !== undefined ? partData.discountPrice : null,
      description: partData.description,
      description_hi: partData.description_hi || null,
      image: partData.image,
      imageFileId: partData.imageFileId || null,
      features: partData.features,
      features_hi: partData.features_hi || null,
      minQuantity: partData.minQuantity !== undefined ? partData.minQuantity : 1,
      brand: partData.brand || null,
      brandId: partData.brandId || null,
      gpd: partData.gpd !== undefined ? partData.gpd : null,
      voltage: partData.voltage || null,
      inletOutletSize: partData.inletOutletSize || null,
      material: partData.material || null,
      color: partData.color || null,
    };

    const { data, error } = await supabaseAdmin
      .from('parts')
      .update(updatedPart)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating part in Supabase:", error);
      throw new Error(`Failed to update part: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    revalidatePath(`/part/${id}`);
    return mapPart(data);
  } catch (error) {
    console.error("Error updating part in Supabase:", error);
    throw new Error("Failed to update part.");
  }
}

export async function deletePart(partId: string): Promise<void> {
  try {
    const { data: partData, error: getError } = await supabaseAdmin
      .from('parts')
      .select('imageFileId')
      .eq('id', partId)
      .maybeSingle();

    if (!getError && partData?.imageFileId) {
      await deleteImageAction(partData.imageFileId);
    }

    const { error } = await supabaseAdmin
      .from('parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error("Error deleting part from Supabase:", error);
      throw new Error(`Failed to delete part: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting part from Supabase:", error);
    throw new Error("Failed to delete part.");
  }
}

// --- Brand Operations ---

export async function getBrandsAdmin(): Promise<Brand[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching brands for admin from Supabase:", error);
      return [];
    }
    return (data || []).map(mapBrand);
  } catch (error) {
    console.error("Error fetching brands for admin from Supabase:", error);
    return [];
  }
}

export async function addBrand(brandData: Omit<Brand, 'id'>): Promise<Brand> {
  try {
    const id = crypto.randomUUID();
    const newBrand = {
      id,
      name: brandData.name,
      image: brandData.image || null,
      imageFileId: brandData.imageFileId || null,
      description: brandData.description || null,
      whatsappNumber: brandData.whatsappNumber || null,
    };

    const { data, error } = await supabaseAdmin
      .from('brands')
      .insert([newBrand])
      .select()
      .single();

    if (error) {
      console.error("Error adding brand to Supabase:", error);
      throw new Error(`Failed to add brand: ${error.message}`);
    }

    revalidatePath('/admin');
    return mapBrand(data);
  } catch (error) {
    console.error("Error adding brand to Supabase:", error);
    throw new Error("Failed to add brand.");
  }
}

export async function updateBrand(brandData: Brand): Promise<Brand> {
  try {
    const { id } = brandData;

    const { data: oldData, error: getError } = await supabaseAdmin
      .from('brands')
      .select('imageFileId')
      .eq('id', id)
      .maybeSingle();

    if (!getError && oldData) {
      if (brandData.imageFileId && oldData.imageFileId && brandData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const updatedBrand = {
      name: brandData.name,
      image: brandData.image || null,
      imageFileId: brandData.imageFileId || null,
      description: brandData.description || null,
      whatsappNumber: brandData.whatsappNumber || null,
    };

    const { data, error } = await supabaseAdmin
      .from('brands')
      .update(updatedBrand)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating brand in Supabase:", error);
      throw new Error(`Failed to update brand: ${error.message}`);
    }

    revalidatePath('/admin');
    return mapBrand(data);
  } catch (error) {
    console.error("Error updating brand in Supabase:", error);
    throw new Error("Failed to update brand.");
  }
}

export async function deleteBrand(brandId: string): Promise<void> {
  try {
    const { data: brandData, error: getError } = await supabaseAdmin
      .from('brands')
      .select('imageFileId')
      .eq('id', brandId)
      .maybeSingle();

    if (!getError && brandData?.imageFileId) {
      await deleteImageAction(brandData.imageFileId);
    }

    const { error } = await supabaseAdmin
      .from('brands')
      .delete()
      .eq('id', brandId);

    if (error) {
      console.error("Error deleting brand from Supabase:", error);
      throw new Error(`Failed to delete brand: ${error.message}`);
    }

    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting brand from Supabase:", error);
    throw new Error("Failed to delete brand.");
  }
}

// --- Category Operations ---

export async function getCategoriesAdmin(): Promise<CategoryEntity[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching categories from Supabase:", error);
      return [];
    }
    return (data || []).map(mapCategory);
  } catch (error) {
    console.error("Error fetching categories from Supabase:", error);
    return [];
  }
}

export async function addCategory(categoryData: Omit<CategoryEntity, 'id'>): Promise<CategoryEntity> {
  try {
    const id = crypto.randomUUID();
    const newCategory = {
      id,
      name: categoryData.name,
      type: categoryData.type,
      parentId: categoryData.parentId || null,
    };

    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert([newCategory])
      .select()
      .single();

    if (error) {
      console.error("Error adding category to Supabase:", error);
      throw new Error(`Failed to add category: ${error.message}`);
    }

    revalidatePath('/admin');
    return mapCategory(data);
  } catch (error) {
    console.error("Error adding category to Supabase:", error);
    throw new Error("Failed to add category");
  }
}

export async function updateCategory(categoryData: CategoryEntity): Promise<CategoryEntity> {
  try {
    const { id } = categoryData;
    const updatedCategory = {
      name: categoryData.name,
      type: categoryData.type,
      parentId: categoryData.parentId || null,
    };

    const { data, error } = await supabaseAdmin
      .from('categories')
      .update(updatedCategory)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating category in Supabase:", error);
      throw new Error(`Failed to update category: ${error.message}`);
    }

    revalidatePath('/admin');
    return mapCategory(data);
  } catch (error) {
    console.error("Error updating category in Supabase:", error);
    throw new Error("Failed to update category");
  }
}

export async function deleteCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error("Error deleting category from Supabase:", error);
      throw new Error(`Failed to delete category: ${error.message}`);
    }

    revalidatePath('/admin');
  } catch (error) {
    console.error("Error deleting category from Supabase:", error);
    throw new Error("Failed to delete category");
  }
}

// --- Banner Operations ---

export async function getBannersAdmin(): Promise<AdBanner[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('banners')
      .select('*')
      .order('order', { ascending: true });

    if (error) {
      console.error("Error fetching banners from Supabase:", error);
      return [];
    }
    return (data || []).map(mapBanner);
  } catch (error) {
    console.error("Error fetching banners from Supabase:", error);
    return [];
  }
}

export async function addBanner(bannerData: Omit<AdBanner, 'id'>): Promise<AdBanner> {
  try {
    const id = crypto.randomUUID();
    const newBanner = {
      id,
      title: bannerData.title,
      title_hi: bannerData.title_hi || null,
      subtitle: bannerData.subtitle,
      subtitle_hi: bannerData.subtitle_hi || null,
      badge: bannerData.badge || null,
      badge_hi: bannerData.badge_hi || null,
      image: bannerData.image,
      imageFileId: bannerData.imageFileId || null,
      link: bannerData.link || null,
      active: bannerData.active ?? false,
      order: bannerData.order ?? 0,
    };

    const { data, error } = await supabaseAdmin
      .from('banners')
      .insert([newBanner])
      .select()
      .single();

    if (error) {
      console.error("Error adding banner to Supabase:", error);
      throw new Error(`Failed to add banner: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return mapBanner(data);
  } catch (error) {
    console.error("Error adding banner to Supabase:", error);
    throw new Error("Failed to add banner");
  }
}

export async function updateBanner(bannerData: AdBanner): Promise<AdBanner> {
  try {
    const { id } = bannerData;

    const { data: oldData, error: getError } = await supabaseAdmin
      .from('banners')
      .select('imageFileId')
      .eq('id', id)
      .maybeSingle();

    if (!getError && oldData) {
      if (bannerData.imageFileId && oldData.imageFileId && bannerData.imageFileId !== oldData.imageFileId) {
        await deleteImageAction(oldData.imageFileId);
      }
    }

    const updatedBanner = {
      title: bannerData.title,
      title_hi: bannerData.title_hi || null,
      subtitle: bannerData.subtitle,
      subtitle_hi: bannerData.subtitle_hi || null,
      badge: bannerData.badge || null,
      badge_hi: bannerData.badge_hi || null,
      image: bannerData.image,
      imageFileId: bannerData.imageFileId || null,
      link: bannerData.link || null,
      active: bannerData.active ?? false,
      order: bannerData.order ?? 0,
    };

    const { data, error } = await supabaseAdmin
      .from('banners')
      .update(updatedBanner)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating banner in Supabase:", error);
      throw new Error(`Failed to update banner: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
    return mapBanner(data);
  } catch (error) {
    console.error("Error updating banner in Supabase:", error);
    throw new Error("Failed to update banner");
  }
}

export async function deleteBanner(bannerId: string): Promise<void> {
  try {
    const { data: bannerData, error: getError } = await supabaseAdmin
      .from('banners')
      .select('imageFileId')
      .eq('id', bannerId)
      .maybeSingle();

    if (!getError && bannerData?.imageFileId) {
      await deleteImageAction(bannerData.imageFileId);
    }

    const { error } = await supabaseAdmin
      .from('banners')
      .delete()
      .eq('id', bannerId);

    if (error) {
      console.error("Error deleting banner from Supabase:", error);
      throw new Error(`Failed to delete banner: ${error.message}`);
    }

    revalidatePath('/admin');
    revalidatePath('/');
  } catch (error) {
    console.error("Error deleting banner from Supabase:", error);
    throw new Error("Failed to delete banner");
  }
}
