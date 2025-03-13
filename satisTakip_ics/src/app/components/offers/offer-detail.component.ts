import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, CurrencyPipe } from '@angular/common';

import {
  OfferService,
  CustomerService,
  OpportunityService,
  OrderService,
} from '../../services';
import { Offer, Order } from '../../models';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-offer-detail',
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
      <app-page-header title="Teklif Detayı" [subtitle]="offer?.title || ''">
        <div class="btn-group">
          <button
            class="btn btn-outline-secondary me-2"
            (click)="navigateTo('/offers')"
          >
            <i class="bi bi-arrow-left me-1"></i> Geri
          </button>
          <a
            [routerLink]="['/offers', offer?.id, 'edit']"
            class="btn btn-outline-primary me-2"
          >
            <i class="bi bi-pencil me-1"></i> Düzenle
          </a>
          <button
            class="btn btn-outline-success"
            [routerLink]="['/orders/new']"
            [queryParams]="{ offerId: offer?.id }"
            [disabled]="!canCreateOrder()"
          >
            <i class="bi bi-cart me-1"></i> Sipariş Oluştur
          </button>
        </div>
      </app-page-header>

      @if (offer) {
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Teklif Bilgileri</h5>
              <div class="d-flex align-items-center">
                <span class="me-2">{{ offer.offerNumber }}</span>
                <app-status-badge
                  [status]="offer.status"
                  type="offer"
                ></app-status-badge>
              </div>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6>Temel Bilgiler</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <th>Başlık</th>
                        <td>{{ offer.title }}</td>
                      </tr>
                      <tr>
                        <th>Müşteri</th>
                        <td>
                          <a [routerLink]="['/customers', offer.customerId]">
                            {{ offer.customerName }}
                          </a>
                        </td>
                      </tr>
                      @if (offer.opportunityId) {
                      <tr>
                        <th>İlgili Fırsat</th>
                        <td>
                          <a
                            [routerLink]="[
                              '/opportunities',
                              offer.opportunityId
                            ]"
                          >
                            {{ getOpportunityTitle(offer.opportunityId) }}
                          </a>
                        </td>
                      </tr>
                      }
                      <tr>
                        <th>Toplam Tutar</th>
                        <td class="fw-bold">
                          {{
                            offer.totalAmount
                              | currency : 'TRY' : 'symbol' : '1.0-0'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <th>Geçerlilik Tarihi</th>
                        <td>{{ offer.validUntil | date : 'dd.MM.yyyy' }}</td>
                      </tr>
                      <tr>
                        <th>Oluşturulma Tarihi</th>
                        <td>{{ offer.createdAt | date : 'dd.MM.yyyy' }}</td>
                      </tr>
                      @if (offer.updatedAt) {
                      <tr>
                        <th>Güncellenme Tarihi</th>
                        <td>{{ offer.updatedAt | date : 'dd.MM.yyyy' }}</td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>Detaylar</h6>
                  <table class="table table-sm">
                    <tbody>
                      @if (offer.description) {
                      <tr>
                        <th>Açıklama</th>
                        <td>{{ offer.description }}</td>
                      </tr>
                      } @if (offer.terms) {
                      <tr>
                        <th>Şartlar ve Koşullar</th>
                        <td>{{ offer.terms }}</td>
                      </tr>
                      } @if (offer.notes) {
                      <tr>
                        <th>Notlar</th>
                        <td>{{ offer.notes }}</td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <h6 class="mt-4">Teklif Kalemleri</h6>
              <div class="table-responsive">
                <table class="table table-bordered table-hover">
                  <thead class="table-light">
                    <tr>
                      <th>Ürün/Hizmet</th>
                      <th>Açıklama</th>
                      <th class="text-end">Miktar</th>
                      <th class="text-end">Birim Fiyat</th>
                      <th class="text-end">İndirim</th>
                      <th class="text-end">KDV</th>
                      <th class="text-end">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (item of offer.items; track $index) {
                    <tr>
                      <td>{{ item.productName }}</td>
                      <td>{{ item.description || '-' }}</td>
                      <td class="text-end">{{ item.quantity }}</td>
                      <td class="text-end">
                        {{
                          item.unitPrice | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                      <td class="text-end">
                        {{ item.discount ? item.discount + '%' : '-' }}
                      </td>
                      <td class="text-end">
                        {{ item.tax ? item.tax + '%' : '-' }}
                      </td>
                      <td class="text-end fw-bold">
                        {{ item.total | currency : 'TRY' : 'symbol' : '1.0-0' }}
                      </td>
                    </tr>
                    }
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="6" class="text-end fw-bold">
                        Toplam Tutar:
                      </td>
                      <td class="text-end fw-bold">
                        {{
                          offer.totalAmount
                            | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">İlgili Siparişler</h5>
            </div>
            <div class="card-body">
              @if (relatedOrders.length > 0) {
              <div class="list-group">
                @for (order of relatedOrders; track order.id) {
                <a
                  [routerLink]="['/orders', order.id]"
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">{{ order.orderNumber }}</h6>
                    <app-status-badge
                      [status]="order.status"
                      type="order"
                    ></app-status-badge>
                  </div>
                  <p class="mb-1">
                    {{
                      order.totalAmount | currency : 'TRY' : 'symbol' : '1.0-0'
                    }}
                  </p>
                  <small
                    >Sipariş Tarihi:
                    {{ order.orderDate | date : 'dd.MM.yyyy' }}</small
                  >
                </a>
                }
              </div>
              } @else {
              <div class="text-center py-4">
                <i class="bi bi-cart fs-1 text-muted"></i>
                <p class="mt-2">Bu teklif için henüz sipariş oluşturulmamış</p>
                @if (canCreateOrder()) {
                <button
                  class="btn btn-sm btn-outline-primary"
                  [routerLink]="['/orders/new']"
                  [queryParams]="{ offerId: offer.id }"
                >
                  <i class="bi bi-plus-circle me-1"></i> Sipariş Oluştur
                </button>
                }
              </div>
              }
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Durum Değiştir</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                @if (offer.status === 'draft') {
                <button
                  class="btn btn-outline-primary"
                  (click)="updateStatus('sent')"
                >
                  <i class="bi bi-send me-1"></i> Teklifi Gönder
                </button>
                } @if (offer.status === 'sent') {
                <button
                  class="btn btn-outline-success mb-2"
                  (click)="updateStatus('accepted')"
                >
                  <i class="bi bi-check-circle me-1"></i> Teklif Kabul Edildi
                </button>
                <button
                  class="btn btn-outline-danger"
                  (click)="updateStatus('rejected')"
                >
                  <i class="bi bi-x-circle me-1"></i> Teklif Reddedildi
                </button>
                } @if (offer.status === 'draft' || offer.status === 'sent') {
                <button
                  class="btn btn-outline-secondary mt-2"
                  (click)="updateStatus('expired')"
                >
                  <i class="bi bi-clock-history me-1"></i> Süresi Doldu
                </button>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      } @else {
      <div class="alert alert-warning">
        Teklif bulunamadı veya yükleniyor...
      </div>
      }
    </div>
  `,
  styles: [
    `
      th {
        width: 40%;
      }
    `,
  ],
})
export class OfferDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private offerService = inject(OfferService);
  private customerService = inject(CustomerService);
  private opportunityService = inject(OpportunityService);
  private orderService = inject(OrderService);

  offer: Offer | undefined;
  relatedOrders: Order[] = [];

  constructor() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadOfferData(+params['id']);
      }
    });
  }

  loadOfferData(offerId: number): void {
    this.offer = this.offerService.getOfferById(offerId);

    if (this.offer) {
      // Get related orders
      const allOrders = this.orderService.getOrders()();
      this.relatedOrders = allOrders.filter(
        (order) => order.offerId === offerId
      );
    } else {
      this.router.navigate(['/offers']);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getOpportunityTitle(opportunityId: number): string {
    // Geçici olarak bilinmeyen fırsat döndür, asenkron olarak güncellenecek
    let title = 'Bilinmeyen Fırsat';

    this.opportunityService.getOpportunityById(opportunityId).subscribe({
      next: (opportunity) => {
        if (opportunity) {
          title = opportunity.title;
        }
      },
      error: (err) => {
        console.error('Fırsat bilgisi alınırken hata oluştu:', err);
      },
    });

    return title;
  }

  canCreateOrder(): boolean {
    if (!this.offer) return false;

    // Can create order only if offer is accepted and no order exists
    return this.offer.status === 'accepted' && this.relatedOrders.length === 0;
  }

  updateStatus(
    status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  ): void {
    if (this.offer) {
      const updatedOffer = {
        ...this.offer,
        status,
      };

      this.offerService.updateOffer(updatedOffer);
      this.offer = updatedOffer;
    }
  }
}
