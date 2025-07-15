export interface Part {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  description: string;
  image: string;
  category: string;
  features: string;
  minQuantity?: number;
}

export interface CartItem extends Part {
  quantity: number;
}
