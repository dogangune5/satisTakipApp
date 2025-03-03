export interface Customer {
  id?: number;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes?: string;
  createdAt: Date;
  updatedAt?: Date;
  status: 'active' | 'inactive' | 'lead';
  contactPerson?: string;
  contactPersonTitle?: string;
  contactPersonPhone?: string;
  taxId?: string;
  sector?: string;
}
