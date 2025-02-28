import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderService } from '../../services';
import { Order } from '../../models';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
} from '../shared';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Siparişler"
        subtitle="Tüm siparişleri görüntüleyin, ekleyin, düzenleyin veya silin"
      >
        <button class="btn btn-primary" routerLink="/orders/new">
          <i class="bi bi-plus-circle me-1"></i> Yeni Sipariş
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
                  placeholder="Sipariş ara..."
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
                <option value="new">Yeni</option>
                <option value="processing">İşleniyor</option>
                <option value="shipped">Gönderildi</option>
                <option value="delivered">Teslim Edildi</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            <div class="col-md-3">
              <select
                class="form-select"
                [(ngModel)]="paymentStatusFilter"
                (change)="filterByStatus()"
              >
                <option value="all">Tüm Ödeme Durumları</option>
                <option value="pending">Bekliyor</option>
                <option value="partial">Kısmi Ödeme</option>
                <option value="paid">Ödendi</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Sipariş No</th>
                  <th>Müşteri</th>
                  <th>Toplam Tutar</th>
                  <th>Sipariş Durumu</th>
                  <th>Ödeme Durumu</th>
                  <th>Sipariş Tarihi</th>
                  <th>Teslimat Tarihi</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders; track order.id) {
                <tr>
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.customerName }}</td>
                  <td>
                    {{
                      order.totalAmount | currency : 'TRY' : 'symbol' : '1.0-0'
                    }}
                  </td>
                  <td>
                    <app-status-badge [status]="order.status" type="order">
                    </app-status-badge>
                  </td>
                  <td>
                    <span
                      class="badge rounded-pill"
                      [ngClass]="{
                        'bg-warning text-dark':
                          order.paymentStatus === 'pending',
                        'bg-info text-dark': order.paymentStatus === 'partial',
                        'bg-success': order.paymentStatus === 'paid'
                      }"
                    >
                      {{ getPaymentStatusText(order.paymentStatus) }}
                    </span>
                  </td>
                  <td>{{ order.orderDate | date : 'dd.MM.yyyy' }}</td>
                  <td>{{ order.deliveryDate | date : 'dd.MM.yyyy' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/orders', order.id]"
                        class="btn btn-outline-primary"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="['/orders', order.id, 'edit']"
                        class="btn btn-outline-secondary"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        (click)="prepareDelete(order)"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteOrderModal"
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
                      Sipariş bulunamadı
                    </div>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <app-confirm-dialog
      modalId="deleteOrderModal"
      title="Sipariş Silme"
      [message]="
        '&quot;' +
        (orderToDelete?.orderNumber || '') +
        '&quot; numaralı siparişi silmek istediğinizden emin misiniz?'
      "
      confirmButtonText="Sil"
      (onConfirm)="deleteOrder()"
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
export class OrderListComponent {
  private orderService = inject(OrderService);

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm = '';
  statusFilter = 'all';
  paymentStatusFilter = 'all';
  orderToDelete: Order | null = null;

  constructor() {
    this.orders = this.orderService.getOrders()();
    this.filteredOrders = [...this.orders];
  }

  search(): void {
    this.applyFilters();
  }

  filterByStatus(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.orders];

    // Apply order status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === this.statusFilter);
    }

    // Apply payment status filter
    if (this.paymentStatusFilter !== 'all') {
      filtered = filtered.filter(
        (order) => order.paymentStatus === this.paymentStatusFilter
      );
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(term) ||
          order.customerName?.toLowerCase().includes(term) ||
          order.notes?.toLowerCase().includes(term)
      );
    }

    this.filteredOrders = filtered;
  }

  prepareDelete(order: Order): void {
    this.orderToDelete = order;
  }

  deleteOrder(): void {
    if (this.orderToDelete) {
      this.orderService.deleteOrder(this.orderToDelete.id!);
      this.orders = this.orderService.getOrders()();
      this.applyFilters();
      this.orderToDelete = null;
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'partial':
        return 'Kısmi Ödeme';
      case 'paid':
        return 'Ödendi';
      default:
        return status;
    }
  }
}
