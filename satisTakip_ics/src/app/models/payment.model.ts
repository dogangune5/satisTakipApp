export interface Payment {
  id?: number;
  paymentNumber: string;
  orderId: number;
  orderNumber?: string;
  customerId: number;
  customerName?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'other';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  receiptNumber?: string;
  bankDetails?: string;
  transactionId?: string;
}
