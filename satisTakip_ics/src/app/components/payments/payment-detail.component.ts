import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';

import { PaymentService, CustomerService, OrderService } from '../../services';
import { Payment, Customer, Order } from '../../models';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-payment-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    NgClass,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Ödeme Detayı"
        [subtitle]="'Ödeme No: ' + (payment ? payment.id : '')"
      >
        <div class="btn-group">
          <button
            class="btn btn-outline-secondary me-2"
            (click)="navigateTo('/payments')"
          >
            <i class="bi bi-arrow-left me-1"></i> Geri
          </button>
          <a
            [routerLink]="['/payments/edit', payment ? payment.id : '']"
            class="btn btn-outline-primary me-2"
          >
            <i class="bi bi-pencil me-1"></i> Düzenle
          </a>
        </div>
      </app-page-header>

      @if (payment) {
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Ödeme Bilgileri</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Ödeme Durumu</p>
                  <app-status-badge
                    [status]="payment.status"
                    [type]="'payment'"
                  ></app-status-badge>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Ödeme Yöntemi</p>
                  <p class="fw-bold">
                    {{ getPaymentMethodText(payment.paymentMethod) }}
                  </p>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Ödeme Tarihi</p>
                  <p class="fw-bold">
                    {{ payment.paymentDate | date : 'dd.MM.yyyy' }}
                  </p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Referans No</p>
                  <p class="fw-bold">
                    {{ payment.receiptNumber || 'Belirtilmedi' }}
                  </p>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <p class="mb-1 text-muted">Ödeme Tutarı</p>
                  <p class="fw-bold fs-4 text-primary">
                    {{ payment.amount | currency : '₺' : 'symbol' : '1.2-2' }}
                  </p>
                </div>
              </div>

              @if (payment.notes) {
              <div class="row">
                <div class="col-12">
                  <p class="mb-1 text-muted">Notlar</p>
                  <p>{{ payment.notes }}</p>
                </div>
              </div>
              }
            </div>
          </div>
        </div>

        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Müşteri Bilgileri</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-12">
                  <p class="mb-1 text-muted">Müşteri</p>
                  <p class="fw-bold">
                    <a [routerLink]="['/customers', payment.customerId]">
                      {{ payment.customerName }}
                    </a>
                  </p>
                </div>
              </div>

              @if (customer) {
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">İletişim Kişisi</p>
                  <p>{{ customer.name }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">E-posta</p>
                  <p>{{ customer.email }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Telefon</p>
                  <p>{{ customer.phone }}</p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Durum</p>
                  <app-status-badge
                    [status]="customer ? customer.status : 'active'"
                    type="customer"
                  ></app-status-badge>
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div>

      @if (order) {
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">İlgili Sipariş Bilgileri</h5>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3">
              <p class="mb-1 text-muted">Sipariş No</p>
              <p class="fw-bold">
                <a [routerLink]="['/orders', order.id]"> #{{ order.id }} </a>
              </p>
            </div>
            <div class="col-md-3">
              <p class="mb-1 text-muted">Sipariş Tarihi</p>
              <p>{{ order.orderDate | date : 'dd.MM.yyyy' }}</p>
            </div>
            <div class="col-md-3">
              <p class="mb-1 text-muted">Sipariş Durumu</p>
              <app-status-badge
                [status]="order.status"
                [type]="'order'"
              ></app-status-badge>
            </div>
            <div class="col-md-3">
              <p class="mb-1 text-muted">Ödeme Durumu</p>
              <app-status-badge
                [status]="order.paymentStatus"
                [type]="'payment'"
              ></app-status-badge>
            </div>
          </div>

          <div class="row mt-3">
            <div class="col-md-6">
              <p class="mb-1 text-muted">Sipariş Tutarı</p>
              <p class="fw-bold">
                {{ order.totalAmount | currency : '₺' : 'symbol' : '1.2-2' }}
              </p>
            </div>
            <div class="col-md-6">
              <p class="mb-1 text-muted">Ödenen Tutar</p>
              <p class="fw-bold">
                {{ getTotalPaidAmount() | currency : '₺' : 'symbol' : '1.2-2' }}
              </p>
            </div>
          </div>

          <div class="mt-3">
            <a
              [routerLink]="['/orders', order.id]"
              class="btn btn-outline-primary"
            >
              <i class="bi bi-eye me-1"></i> Siparişi Görüntüle
            </a>
          </div>
        </div>
      </div>
      }

      <div class="card mb-4">
        <div
          class="card-header bg-light d-flex justify-content-between align-items-center"
        >
          <h5 class="mb-0">Diğer Ödemeler</h5>
          <button
            class="btn btn-sm btn-outline-primary"
            routerLink="/payments/new"
            [queryParams]="{ customerId: payment.customerId }"
          >
            <i class="bi bi-plus-circle me-1"></i> Yeni Ödeme Ekle
          </button>
        </div>
        <div class="card-body">
          @if (relatedPayments.length === 0) {
          <p class="text-center py-3">
            Bu müşteriye ait başka ödeme kaydı bulunmuyor.
          </p>
          } @else {
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tarih</th>
                  <th>Tutar</th>
                  <th>Ödeme Yöntemi</th>
                  <th>Durum</th>
                  <th>İlgili Sipariş</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @for (relatedPayment of relatedPayments; track
                relatedPayment.id) {
                <tr
                  [ngClass]="{
                    'table-active': relatedPayment.id === payment.id
                  }"
                >
                  <td>{{ relatedPayment.id }}</td>
                  <td>
                    {{ relatedPayment.paymentDate | date : 'dd.MM.yyyy' }}
                  </td>
                  <td>
                    {{
                      relatedPayment.amount
                        | currency : '₺' : 'symbol' : '1.2-2'
                    }}
                  </td>
                  <td>
                    {{ getPaymentMethodText(relatedPayment.paymentMethod) }}
                  </td>
                  <td>
                    <app-status-badge
                      [status]="relatedPayment.status"
                      [type]="'payment'"
                    ></app-status-badge>
                  </td>
                  <td>
                    @if (relatedPayment.orderId) {
                    <a [routerLink]="['/orders', relatedPayment.orderId]">
                      #{{ relatedPayment.orderId }}
                    </a>
                    } @else {
                    <span class="text-muted">-</span>
                    }
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/payments', relatedPayment.id]"
                        class="btn btn-outline-primary"
                        title="Görüntüle"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="['/payments/edit', relatedPayment.id]"
                        class="btn btn-outline-secondary"
                        title="Düzenle"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                    </div>
                  </td>
                </tr>
                }
              </tbody>
            </table>
          </div>
          }
        </div>
      </div>
      } @else {
      <div class="alert alert-warning">
        Ödeme bulunamadı veya silinmiş olabilir.
      </div>
      }
    </div>
  `,
  styles: [
    `
      .card {
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .card-header {
        border-radius: 0.5rem 0.5rem 0 0 !important;
        font-weight: 600;
      }

      .text-muted {
        font-size: 0.85rem;
      }
    `,
  ],
})
export class PaymentDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private paymentService = inject(PaymentService);
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);

  payment: Payment | null = null;
  customer: Customer | null = null;
  order: Order | null = null;
  relatedPayments: Payment[] = [];

  constructor() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        const paymentId = +params['id'];
        this.loadPaymentData(paymentId);
      }
    });
  }

  loadPaymentData(paymentId: number): void {
    const payment = this.paymentService.getPaymentById(paymentId);

    if (!payment) {
      this.router.navigate(['/payments']);
      return;
    }

    this.payment = payment;

    // Load customer data
    if (this.payment.customerId) {
      this.customerService.getCustomerById(this.payment.customerId).subscribe({
        next: (customer) => {
          if (customer) {
            this.customer = customer;
          }
        },
        error: (err) => {
          console.error('Müşteri yüklenirken hata oluştu:', err);
        },
      });
    }

    // Load order data if available
    if (this.payment && this.payment.orderId) {
      this.orderService.getOrderById(this.payment.orderId).subscribe({
        next: (order) => {
          if (order) {
            this.order = order;
          }
        },
        error: (err) => {
          console.error('Sipariş bilgileri alınırken hata oluştu:', err);
        },
      });
    }

    // Load related payments (other payments from the same customer)
    this.loadRelatedPayments();
  }

  loadRelatedPayments(): void {
    if (!this.payment) return;

    this.relatedPayments = this.paymentService
      .getPayments()()
      .filter(
        (p) =>
          p.customerId === this.payment?.customerId && p.id !== this.payment?.id
      );
  }

  getTotalPaidAmount(): number {
    if (!this.order) return 0;

    // Get all completed payments for this order
    const orderPayments = this.paymentService
      .getPayments()()
      .filter((p) => p.orderId === this.order?.id && p.status === 'completed');

    // Calculate total paid amount
    return orderPayments.reduce((sum, payment) => sum + payment.amount, 0);
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
