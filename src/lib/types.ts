
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
  gpd?: number;
  voltage?: string; 
  inletOutletSize?: string;
  material?: string;
  color?: string;
}

export interface CartItem extends Part {
  quantity: number;
}

    