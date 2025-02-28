import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import {
  CustomerListComponent,
  CustomerFormComponent,
  CustomerDetailComponent,
} from './components/customers';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'customers', component: CustomerListComponent },
  { path: 'customers/new', component: CustomerFormComponent },
  { path: 'customers/:id', component: CustomerDetailComponent },
  { path: 'customers/:id/edit', component: CustomerFormComponent },
  // Diğer modüller için yönlendirmeler daha sonra eklenecek
  { path: '**', redirectTo: '/dashboard' },
];
