import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, CurrencyPipe, NgClass } from '@angular/common';

import { OrderService } from '../../services/order.service';
import { CustomerService } from '../../services/customer.service';
import { OfferService } from '../../services/offer.service';
import { Order } from '../../models/order.model';
import { Customer } from '../../models/customer.model';
import { Offer } from '../../models/offer.model';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    CurrencyPipe,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Sipariş Detayı"
        [subtitle]="'Sipariş No: ' + (order ? order.id : '')"
      >
        <div class="btn-group">
          <button
            class="btn btn-outline-secondary me-2"
            (click)="navigateTo('/orders')"
          >
            <i class="bi bi-arrow-left me-1"></i> Geri
          </button>
          <a
            [routerLink]="['/orders/edit', order ? order.id : '']"
            class="btn btn-outline-primary me-2"
          >
            <i class="bi bi-pencil me-1"></i> Düzenle
          </a>
        </div>
      </app-page-header>

      @if (order) {
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Sipariş Bilgileri</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Sipariş Durumu</p>
                  <app-status-badge
                    [status]="order.status"
                    [type]="'order'"
                  ></app-status-badge>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Ödeme Durumu</p>
                  <app-status-badge
                    [status]="order.paymentStatus"
                    [type]="'payment'"
                  ></app-status-badge>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Sipariş Tarihi</p>
                  <p class="fw-bold">
                    {{ order.orderDate | date : 'dd.MM.yyyy' }}
                  </p>
                </div>
                <div class="col-md-6">
                  <p class="mb-1 text-muted">Teslimat Tarihi</p>
                  <p class="fw-bold">
                    {{
                      order.deliveryDate
                        ? (order.deliveryDate | date : 'dd.MM.yyyy')
                        : 'Belirtilmedi'
                    }}
                  </p>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <p class="mb-1 text-muted">Toplam Tutar</p>
                  <p class="fw-bold fs-4 text-primary">
                    {{
                      order.totalAmount | currency : '₺' : 'symbol' : '1.2-2'
                    }}
                  </p>
                </div>
              </div>

              @if (order.notes) {
              <div class="row">
                <div class="col-12">
                  <p class="mb-1 text-muted">Notlar</p>
                  <p>{{ order.notes }}</p>
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
                    <a [routerLink]="['/customers', order.customerId]">
                      {{ order.customerName }}
                    </a>
                  </p>
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <p class="mb-1 text-muted">Teslimat Adresi</p>
                  <p>{{ order.shippingAddress || 'Belirtilmedi' }}</p>
                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <p class="mb-1 text-muted">Fatura Adresi</p>
                  <p>{{ order.billingAddress || 'Belirtilmedi' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Sipariş Kalemleri</h5>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead class="table-light">
                <tr>
                  <th>Ürün/Hizmet</th>
                  <th>Açıklama</th>
                  <th class="text-center">Miktar</th>
                  <th class="text-end">Birim Fiyat</th>
                  <th class="text-center">İndirim</th>
                  <th class="text-center">KDV</th>
                  <th class="text-end">Toplam</th>
                </tr>
              </thead>
              <tbody>
                @for (item of order.items; track $index) {
                <tr>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.description || '-' }}</td>
                  <td class="text-center">{{ item.quantity }}</td>
                  <td class="text-end">
                    {{ item.unitPrice | currency : '₺' : 'symbol' : '1.2-2' }}
                  </td>
                  <td class="text-center">
                    {{ item.discount ? item.discount + '%' : '-' }}
                  </td>
                  <td class="text-center">{{ item.tax }}%</td>
                  <td class="text-end">
                    {{ item.total | currency : '₺' : 'symbol' : '1.2-2' }}
                  </td>
                </tr>
                }
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="6" class="text-end fw-bold">Toplam:</td>
                  <td class="text-end fw-bold">
                    {{
                      order.totalAmount | currency : '₺' : 'symbol' : '1.2-2'
                    }}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      @if (order.offerId) {
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">İlgili Teklif</h5>
        </div>
        <div class="card-body">
          <p>
            Bu sipariş
            <a [routerLink]="['/offers', order.offerId]">
              #{{ order.offerId }} numaralı teklif
            </a>
            üzerinden oluşturulmuştur.
          </p>
        </div>
      </div>
      }

      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Ödeme Bilgileri</h5>
        </div>
        <div class="card-body">
          <p>
            <app-status-badge
              [status]="order.paymentStatus"
              [type]="'payment'"
            ></app-status-badge>
            <span class="ms-2">
              @switch (order.paymentStatus) { @case ('pending') { Ödeme henüz
              yapılmamıştır. } @case ('partial') { Kısmi ödeme alınmıştır. }
              @case ('paid') { Ödeme tamamlanmıştır. } }
            </span>
          </p>
          <div class="mt-3">
            <button
              class="btn btn-outline-primary"
              routerLink="/payments/new"
              [queryParams]="{ orderId: order.id }"
            >
              <i class="bi bi-cash me-1"></i> Ödeme Ekle
            </button>
          </div>
        </div>
      </div>
      } @else {
      <div class="alert alert-warning">
        Sipariş bulunamadı veya silinmiş olabilir.
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
export class OrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private offerService = inject(OfferService);

  order: Order | null = null;
  customer: Customer | null = null;
  offer: Offer | null = null;

  constructor() {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        const orderId = +params['id'];
        this.loadOrderData(orderId);
      }
    });
  }

  loadOrderData(orderId: number): void {
    console.log(`Sipariş bilgileri yükleniyor, ID: ${orderId}`);
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        if (order) {
          this.order = order;
          console.log('Sipariş bilgileri yüklendi:', this.order);

          // Get customer details if available
          if (this.order.customerId) {
            this.customerService
              .getCustomerById(this.order.customerId)
              .subscribe({
                next: (customer) => {
                  if (customer) {
                    this.customer = customer;
                  }
                },
                error: (err) => {
                  console.error(
                    'Müşteri bilgileri yüklenirken hata oluştu:',
                    err
                  );
                },
              });
          }

          // Get offer details if available
          if (this.order.offerId) {
            this.offerService.getOfferById(this.order.offerId).subscribe({
              next: (offer) => {
                if (offer) {
                  this.offer = offer;
                }
              },
              error: (err) => {
                console.error('Teklif bilgileri yüklenirken hata oluştu:', err);
              },
            });
          }
        } else {
          console.error('Sipariş bulunamadı');
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        console.error('Sipariş yüklenirken hata oluştu:', err);
        this.router.navigate(['/orders']);
      },
    });
  }

  updateStatus(
    status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  ): void {
    if (this.order) {
      const updatedOrder = {
        ...this.order,
        status,
      };

      console.log('Sipariş durumu güncelleniyor:', status);
      this.orderService.updateOrder(updatedOrder).subscribe({
        next: (updated) => {
          console.log('Sipariş durumu güncellendi:', updated);
          this.order = updated;
        },
        error: (err) => {
          console.error('Sipariş durumu güncellenirken hata oluştu:', err);
        },
      });
    }
  }

  updatePaymentStatus(paymentStatus: 'pending' | 'partial' | 'paid'): void {
    if (this.order) {
      const updatedOrder = {
        ...this.order,
        paymentStatus,
      };

      console.log('Ödeme durumu güncelleniyor:', paymentStatus);
      this.orderService.updateOrder(updatedOrder).subscribe({
        next: (updated) => {
          console.log('Ödeme durumu güncellendi:', updated);
          this.order = updated;
        },
        error: (err) => {
          console.error('Ödeme durumu güncellenirken hata oluştu:', err);
        },
      });
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'new':
        return 'Yeni';
      case 'processing':
        return 'İşleniyor';
      case 'shipped':
        return 'Gönderildi';
      case 'delivered':
        return 'Teslim Edildi';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
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

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
