"use server";

import { cookies } from 'next/headers';
import { supabasePublic } from './supabase';
import type { Part, Brand, AdBanner } from './types';

async function getUserRole(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get('ro-user-role')?.value || null;
  } catch (error) {
    // Falls back to anonymous during build/static generation
    return null;
  }
}

function mapPart(dbPart: any, isBusiness: boolean): Part {
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
    businessPrice: (isBusiness && dbPart.business_price !== null && dbPart.business_price !== undefined)
      ? Number(dbPart.business_price)
      : undefined,
    businessOnly: dbPart.business_only ?? false,
  };
}

export async function getAllParts(page?: number, limit?: number): Promise<Part[]> {
  try {
    const role = await getUserRole();
    const isBusiness = role === 'business';

    let query = supabasePublic
      .from('parts')
      .select('*')
      .order('name', { ascending: true });

    // Filter business-only parts directly in database query
    if (!isBusiness) {
      query = query.eq('business_only', false);
    }

    if (page !== undefined && limit !== undefined) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching parts from Supabase:", error);
      return [];
    }
    return (data || []).map(p => mapPart(p, isBusiness));
  } catch (error) {
    console.error("Error fetching parts from Supabase:", error);
    return [];
  }
}

export async function getPartById(id: string): Promise<Part | null> {
  try {
    const role = await getUserRole();
    const isBusiness = role === 'business';

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    let query = supabasePublic.from('parts').select('*');

    if (isUuid) {
      query = query.eq('id', id);
    } else {
      query = query.eq('sku', id);
    }

    // Filter business-only parts directly in database query
    if (!isBusiness) {
      query = query.eq('business_only', false);
    }

    const { data, error } = await query.single();
    if (error) {
      // Fallback: if isUuid check succeeded but record not found, try SKU check
      if (isUuid) {
        let fallbackQuery = supabasePublic
          .from('parts')
          .select('*')
          .eq('sku', id);

        if (!isBusiness) {
          fallbackQuery = fallbackQuery.eq('business_only', false);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery.maybeSingle();
        if (!fallbackError && fallbackData) {
          return mapPart(fallbackData, isBusiness);
        }
      }
      console.error("Error fetching part by ID from Supabase:", error);
      return null;
    }
    return data ? mapPart(data, isBusiness) : null;
  } catch (error) {
    console.error("Error fetching part by ID from Supabase:", error);
    return null;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await supabasePublic
      .from('brands')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error("Error fetching brands from Supabase:", error);
      return [];
    }

    return (data || []).map(b => ({
      id: b.id,
      name: b.name,
      image: b.image || undefined,
      imageFileId: b.imageFileId || undefined,
      description: b.description || undefined,
      whatsappNumber: b.whatsappNumber || undefined,
    }));
  } catch (error) {
    console.error("Error fetching brands from Supabase:", error);
    return [];
  }
}

export async function getAllBanners(): Promise<AdBanner[]> {
  try {
    const { data, error } = await supabasePublic
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('order', { ascending: true });

    if (error) {
      console.error("Error fetching banners from Supabase:", error);
      return [];
    }

    return (data || []).map(b => ({
      id: b.id,
      title: b.title,
      title_hi: b.title_hi || undefined,
      subtitle: b.subtitle,
      subtitle_hi: b.subtitle_hi || undefined,
      badge: b.badge || undefined,
      badge_hi: b.badge_hi || undefined,
      image: b.image,
      imageFileId: b.imageFileId || undefined,
      link: b.link || undefined,
      active: b.active ?? false,
      order: b.order ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching banners from Supabase:", error);
    return [];
  }
}
