export interface OrderItem {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  description?: string;
}

export interface Order {
  id?: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate?: Date;
  deliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
  shippingAddress?: string;
  billingAddress?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  offerId?: number;
}
