export interface OfferItem {
  id?: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  tax?: number;
  total: number;
  description?: string;
}

export interface Offer {
  id?: number;
  offerNumber: string;
  customerId: number;
  customerName?: string;
  title: string;
  description?: string;
  items: OfferItem[];
  totalAmount: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired' | 'pending';
  validUntil: Date;
  createdAt: Date;
  updatedAt?: Date;
  notes?: string;
  terms?: string;
  opportunityId?: number;
}
