export interface Customer {
  id?: number;
  name: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone: string;
  address: string;
  city?: string;
  country?: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  status?: 'active' | 'inactive' | 'lead';
  contactPerson?: string;
  contactPersonTitle?: string;
  contactPersonPhone?: string;
  taxId?: string;
  sector?: string;
  type?: 'corporate' | 'individual';
  industry?: string;
  website?: string;
}
