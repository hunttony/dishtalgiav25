export interface ProductSize {
  id: string;
  name: string;
  price: number;
  description: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sizes: ProductSize[];
  image: string;
  price: number; // Added price at product level
  ingredients?: string[]; // Made optional
  nutritionInfo?: string; // Made optional
  category?: string; // Made optional
  rating?: number; // Made optional
  reviewCount?: number; // Made optional
  description: string;
  inStock?: boolean; // Made optional
}

export interface CartItem {
  productId: number;
  sizeId: string;
  quantity: number;
  productName: string;
  sizeName: string;
  price: number;
  image: string;
}
