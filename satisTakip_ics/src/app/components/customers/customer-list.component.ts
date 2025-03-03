import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CustomerService } from '../../services';
import { Customer } from '../../models';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
} from '../shared';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Müşteriler"
        subtitle="Tüm müşterileri görüntüleyin, ekleyin, düzenleyin veya silin"
      >
        <button class="btn btn-primary" routerLink="/customers/new">
          <i class="bi bi-plus-circle me-1"></i> Yeni Müşteri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row mb-3">
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Müşteri ara..."
                  [(ngModel)]="searchTerm"
                  (input)="search()"
                />
              </div>
            </div>
            <div class="col-md-3">
              <select
                class="form-select"
                [(ngModel)]="statusFilter"
                (change)="filterByStatus()"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
                <option value="lead">Potansiyel</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Firma Adı</th>
                  <th>İletişim Kişisi</th>
                  <th>E-posta</th>
                  <th>Telefon</th>
                  <th>Şehir</th>
                  <th>Durum</th>
                  <th>Kayıt Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @if (loading) {
                <tr>
                  <td colspan="8" class="text-center py-4">
                    <div class="d-flex justify-content-center">
                      <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Yükleniyor...</span>
                      </div>
                    </div>
                  </td>
                </tr>
                } @else { @for (customer of filteredCustomers; track
                customer.id) {
                <tr>
                  <td>
                    <a
                      [routerLink]="['/customers', customer.id]"
                      class="fw-bold text-decoration-none"
                    >
                      {{ customer.companyName }}
                    </a>
                  </td>
                  <td>{{ customer.contactPerson || customer.name }}</td>
                  <td>{{ customer.email }}</td>
                  <td>{{ customer.phone }}</td>
                  <td>{{ customer.city }}</td>
                  <td>
                    <app-status-badge
                      [status]="customer.status"
                      type="customer"
                    >
                    </app-status-badge>
                  </td>
                  <td>{{ customer.createdAt | date : 'dd.MM.yyyy' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/customers', customer.id]"
                        class="btn btn-outline-primary"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="['/customers', customer.id, 'edit']"
                        class="btn btn-outline-secondary"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        (click)="prepareDelete(customer)"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteCustomerModal"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
                } @empty {
                <tr>
                  <td colspan="8" class="text-center py-4">
                    <div class="text-muted">
                      <i class="bi bi-info-circle me-2"></i>
                      Müşteri bulunamadı
                    </div>
                  </td>
                </tr>
                } }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      modalId="deleteCustomerModal"
      title="Müşteri Silme"
      [message]="
        '&quot;' +
        (customerToDelete?.companyName || '') +
        '&quot; müşterisini silmek istediğinizden emin misiniz?'
      "
      confirmButtonText="Sil"
      (onConfirm)="deleteCustomer()"
    >
    </app-confirm-dialog>
  `,
  styles: [
    `
      .table th {
        font-weight: 600;
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class CustomerListComponent implements OnInit {
  private customerService = inject(CustomerService);

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  searchTerm = '';
  statusFilter = 'all';
  customerToDelete: Customer | null = null;
  loading = true;
  error = '';

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.loading = true;
    this.customerService.fetchCustomers().subscribe({
      next: (data) => {
        this.customers = data;
        this.filteredCustomers = [...this.customers];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Müşteriler yüklenirken bir hata oluştu.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  search(): void {
    this.applyFilters();
  }

  filterByStatus(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.customers];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(
        (customer) => customer.status === this.statusFilter
      );
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (customer) =>
          customer.companyName.toLowerCase().includes(term) ||
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          customer.phone.toLowerCase().includes(term) ||
          customer.city.toLowerCase().includes(term) ||
          (customer.contactPerson &&
            customer.contactPerson.toLowerCase().includes(term))
      );
    }

    this.filteredCustomers = filtered;
  }

  prepareDelete(customer: Customer): void {
    this.customerToDelete = customer;
  }

  deleteCustomer(): void {
    if (this.customerToDelete && this.customerToDelete.id) {
      this.loading = true;
      this.customerService.deleteCustomer(this.customerToDelete.id).subscribe({
        next: () => {
          this.loadCustomers();
          this.customerToDelete = null;
        },
        error: (err) => {
          this.error = 'Müşteri silinirken bir hata oluştu.';
          this.loading = false;
          console.error(err);
        },
      });
    }
  }
}
