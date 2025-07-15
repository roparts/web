export interface Part {
  id: string;
  name: string;
  name_hi?: string;
  price: number;
  discountPrice?: number;
  description: string;
  description_hi?: string;
  image: string;
  category: string;
  category_hi?: string;
  features: string;
  features_hi?: string;
  minQuantity?: number;
}

export interface CartItem extends Part {
  quantity: number;
}
