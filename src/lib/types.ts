
export type MainCategory =
  | 'Domestic RO Parts'
  | 'Commercial RO Parts'
  | 'RO Accessories & Tools'
  | 'Complete RO Systems'
  | 'Service Kits & Combo Packs';

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
  features: string;
  features_hi?: string;
  minQuantity?: number;
  brand?: string;
  // New detailed fields
  gpd?: number;
  voltage?: string; // e.g., "24V", "36V"
  inletOutletSize?: string; // e.g., "1/4"", "3/8""
  material?: string; // e.g., "ABS", "FRP", "Stainless Steel"
  color?: string; // e.g., "White", "Blue", "Transparent"
}

export interface CartItem extends Part {
  quantity: number;
}
