export interface Opportunity {
  id?: number;
  title: string;
  customerId: number;
  customerName?: string;
  description: string;
  value: number;
  status:
    | 'new'
    | 'qualified'
    | 'proposition'
    | 'negotiation'
    | 'closed-won'
    | 'closed-lost';
  probability: number; // 0-100
  expectedCloseDate: Date;
  createdAt: Date;
  updatedAt?: Date;
  assignedTo?: string;
  products?: string[];
  notes?: string;
  source?: string;
  priority?: 'low' | 'medium' | 'high';
}
