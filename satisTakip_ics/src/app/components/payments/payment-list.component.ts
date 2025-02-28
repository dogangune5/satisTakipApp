import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { PaymentService, OrderService } from '../../services';
import { Payment, Order } from '../../models';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
} from '../shared';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    RouterLink,
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
        [title]="'Ödemeler'"
        [subtitle]="'Tüm ödemeleri görüntüleyin ve yönetin'"
      >
        <button class="btn btn-primary" routerLink="/payments/new">
          <i class="bi bi-plus-circle me-1"></i> Yeni Ödeme
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
                  placeholder="Müşteri veya sipariş ara..."
                  [(ngModel)]="searchTerm"
                  (input)="search()"
                />
                @if (searchTerm) {
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  (click)="clearSearch()"
                >
                  <i class="bi bi-x"></i>
                </button>
                }
              </div>
            </div>
            <div class="col-md-3">
              <select
                class="form-select"
                [(ngModel)]="selectedPaymentMethod"
                (change)="applyFilters()"
              >
                <option value="">Tüm Ödeme Yöntemleri</option>
                <option value="cash">Nakit</option>
                <option value="credit_card">Kredi Kartı</option>
                <option value="bank_transfer">Banka Transferi</option>
                <option value="check">Çek</option>
                <option value="other">Diğer</option>
              </select>
            </div>
            <div class="col-md-3">
              <select
                class="form-select"
                [(ngModel)]="selectedStatus"
                (change)="applyFilters()"
              >
                <option value="">Tüm Durumlar</option>
                <option value="completed">Tamamlandı</option>
                <option value="pending">Beklemede</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
            <div class="col-md-2">
              <button
                class="btn btn-outline-secondary w-100"
                (click)="resetFilters()"
              >
                Filtreleri Sıfırla
              </button>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover table-striped">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Müşteri</th>
                  <th>Sipariş No</th>
                  <th>Tutar</th>
                  <th>Ödeme Yöntemi</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @if (filteredPayments().length === 0) {
                <tr>
                  <td colspan="8" class="text-center py-4">
                    @if (searchTerm || selectedPaymentMethod || selectedStatus)
                    {
                    <p class="mb-0">
                      <i class="bi bi-info-circle me-2"></i>
                      Arama kriterlerinize uygun ödeme bulunamadı.
                    </p>
                    <button
                      class="btn btn-sm btn-outline-secondary mt-2"
                      (click)="resetFilters()"
                    >
                      Filtreleri Temizle
                    </button>
                    } @else {
                    <p class="mb-0">
                      <i class="bi bi-info-circle me-2"></i>
                      Henüz ödeme kaydı bulunmuyor.
                    </p>
                    <button
                      class="btn btn-sm btn-primary mt-2"
                      routerLink="/payments/new"
                    >
                      <i class="bi bi-plus-circle me-1"></i> Yeni Ödeme Ekle
                    </button>
                    }
                  </td>
                </tr>
                } @else { @for (payment of filteredPayments(); track payment.id)
                {
                <tr>
                  <td>{{ payment.id }}</td>
                  <td>
                    <a [routerLink]="['/customers', payment.customerId]">
                      {{ payment.customerName }}
                    </a>
                  </td>
                  <td>
                    @if (payment.orderId) {
                    <a [routerLink]="['/orders', payment.orderId]">
                      #{{ payment.orderId }}
                    </a>
                    } @else {
                    <span class="text-muted">-</span>
                    }
                  </td>
                  <td class="fw-bold">
                    {{ payment.amount | currency : '₺' : 'symbol' : '1.2-2' }}
                  </td>
                  <td>{{ getPaymentMethodText(payment.paymentMethod) }}</td>
                  <td>
                    <app-status-badge
                      [status]="payment.status"
                      [type]="'payment'"
                    ></app-status-badge>
                  </td>
                  <td>{{ payment.paymentDate | date : 'dd.MM.yyyy' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/payments', payment.id]"
                        class="btn btn-outline-primary"
                        title="Görüntüle"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="['/payments/edit', payment.id]"
                        class="btn btn-outline-secondary"
                        title="Düzenle"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button
                        class="btn btn-outline-danger"
                        title="Sil"
                        (click)="prepareDelete(payment)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
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
      modalId="deletePaymentModal"
      title="Ödeme Sil"
      message="
        {{
        paymentToDelete?.id
      }} numaralı ödemeyi silmek istediğinizden emin misiniz?
      "
      confirmButtonText="Sil"
      (onConfirm)="deletePayment()"
    ></app-confirm-dialog>
  `,
  styles: [
    `
      .table th {
        font-weight: 600;
        color: #495057;
      }

      .table td {
        vertical-align: middle;
      }
    `,
  ],
})
export class PaymentListComponent {
  private paymentService = inject(PaymentService);
  private orderService = inject(OrderService);

  payments = this.paymentService.getPayments();
  filteredPayments = signal<Payment[]>([]);

  searchTerm = '';
  selectedPaymentMethod = '';
  selectedStatus = '';

  showDeleteConfirm = false;
  paymentToDelete: Payment | null = null;

  constructor() {
    this.filteredPayments.set(this.payments());
  }

  search(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.payments();

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.customerName?.toLowerCase().includes(term) ||
          payment.orderId?.toString().includes(term) ||
          payment.receiptNumber?.toLowerCase().includes(term)
      );
    }

    // Apply payment method filter
    if (this.selectedPaymentMethod) {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === this.selectedPaymentMethod
      );
    }

    // Apply status filter
    if (this.selectedStatus) {
      filtered = filtered.filter(
        (payment) => payment.status === this.selectedStatus
      );
    }

    this.filteredPayments.set(filtered);
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedPaymentMethod = '';
    this.selectedStatus = '';
    this.filteredPayments.set(this.payments());
  }

  prepareDelete(payment: Payment): void {
    this.paymentToDelete = payment;
    this.showDeleteConfirm = true;
  }

  deletePayment(): void {
    if (this.paymentToDelete && this.paymentToDelete.id !== undefined) {
      this.paymentService.deletePayment(this.paymentToDelete.id);

      // If payment is linked to an order, update order payment status
      if (this.paymentToDelete.orderId) {
        this.updateOrderPaymentStatus(this.paymentToDelete.orderId);
      }

      this.paymentToDelete = null;
      this.showDeleteConfirm = false;
      this.applyFilters();
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'cash':
        return 'Nakit';
      case 'credit_card':
        return 'Kredi Kartı';
      case 'bank_transfer':
        return 'Banka Transferi';
      case 'check':
        return 'Çek';
      case 'other':
        return 'Diğer';
      default:
        return method;
    }
  }

  private updateOrderPaymentStatus(orderId: number): void {
    const order = this.orderService.getOrderById(orderId);
    if (order) {
      const newPaymentStatus = this.calculateOrderPaymentStatus(order);
      const updatedOrder = { ...order, paymentStatus: newPaymentStatus };
      this.orderService.updateOrder(updatedOrder);
    }
  }

  private calculateOrderPaymentStatus(
    order: Order
  ): 'pending' | 'partial' | 'paid' {
    const payments = this.paymentService.getPaymentsByOrderId(order.id || 0);
    if (!payments.length) return 'pending';

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    if (totalPaid >= order.totalAmount) return 'paid';
    return 'partial';
  }
}
