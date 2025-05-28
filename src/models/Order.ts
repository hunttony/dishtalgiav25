import { ObjectId } from 'mongodb';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  _id: string | ObjectId;
  productId: string | ObjectId;
  productName: string;
  sizeId?: string;
  sizeName?: string;
  size?: string;
  price: number;
  quantity: number;
  image: string;
  name: string;
}

export interface OrderBase {
  _id?: ObjectId;
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  status: OrderStatus;
}

export interface Order extends OrderBase {
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'paypal' | 'credit_card' | 'stripe';
  paymentId?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  notes?: string;
  
  // For backward compatibility
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}
