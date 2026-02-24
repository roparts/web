
export type MainCategory = string;

export interface CategoryEntity {
  id: string;
  name: string;
  type: 'main' | 'sub';
  parentId?: string; // For subcategories belonging to a main category (optional linkage)
}

export interface Brand {
  id: string;
  name: string;
  image?: string;
  imageFileId?: string;
  description?: string;
  whatsappNumber?: string;
}

export interface Part {
  id: string;
  name: string;
  name_hi?: string;
  mainCategory: MainCategory;
  subcategory: string;
  price: number;
  discountPrice?: number;
  description: string;
  description_hi?: string;
  image: string;
  imageFileId?: string; // Add this to store the ImageKit file ID
  features: string;
  features_hi?: string;
  minQuantity?: number;
  brand?: string;
  brandId?: string; // Link to the Brand document
  gpd?: number;
  voltage?: string;
  inletOutletSize?: string;
  material?: string;
  color?: string;
}

export interface CartItem extends Part {
  quantity: number;
}

export interface AdBanner {
  id: string;
  title: string;
  title_hi?: string;
  subtitle: string;
  subtitle_hi?: string;
  badge?: string;
  badge_hi?: string;
  image: string;
  imageFileId?: string;
  link?: string;
  active: boolean;
  order: number;
}
