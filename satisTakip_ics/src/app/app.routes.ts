import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {
  CustomerListComponent,
  CustomerFormComponent,
  CustomerDetailComponent,
} from './components/customers';
import {
  OpportunityListComponent,
  OpportunityFormComponent,
  OpportunityDetailComponent,
} from './components/opportunities';
import {
  OfferListComponent,
  OfferFormComponent,
  OfferDetailComponent,
} from './components/offers';
import {
  OrderListComponent,
  OrderFormComponent,
  OrderDetailComponent,
} from './components/orders';
import {
  PaymentListComponent,
  PaymentFormComponent,
  PaymentDetailComponent,
} from './components/payments';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },

  // Müşteriler
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'customers/:id/edit', component: CustomerFormComponent },

  // Fırsatlar
  { path: 'opportunities', component: OpportunityListComponent },
  { path: 'opportunities/new', component: OpportunityFormComponent },
  { path: 'opportunities/:id', component: OpportunityDetailComponent },
  { path: 'opportunities/:id/edit', component: OpportunityFormComponent },

  // Teklifler
  { path: 'offers', component: OfferListComponent },
  { path: 'offers/new', component: OfferFormComponent },
  { path: 'offers/:id', component: OfferDetailComponent },
  { path: 'offers/:id/edit', component: OfferFormComponent },

  // Siparişler
  { path: 'orders', component: OrderListComponent },
  { path: 'orders/new', component: OrderFormComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
  { path: 'orders/:id/edit', component: OrderFormComponent },

  // Ödemeler
  { path: 'payments', component: PaymentListComponent },
  { path: 'payments/new', component: PaymentFormComponent },
  { path: 'payments/:id', component: PaymentDetailComponent },
  { path: 'payments/:id/edit', component: PaymentFormComponent },

  // Bilinmeyen yollar için yönlendirme
  { path: '**', redirectTo: '/dashboard' },
];
