export interface Part {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  features: string;
}

export interface CartItem extends Part {
  quantity: number;
}
