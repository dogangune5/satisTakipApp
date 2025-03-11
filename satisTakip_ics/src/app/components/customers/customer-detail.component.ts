import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, CurrencyPipe } from '@angular/common';

import {
  CustomerService,
  OpportunityService,
  OfferService,
  OrderService,
  PaymentService,
} from '../../services';
import { Customer } from '../../models';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    NgClass,
    CurrencyPipe,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Müşteri Detayları"
        [subtitle]="customer?.companyName || ''"
      >
        <div class="btn-group">
          <a
            [routerLink]="['/customers', customer?.id, 'edit']"
            class="btn btn-outline-primary"
          >
            <i class="bi bi-pencil me-1"></i> Düzenle
          </a>
          <a routerLink="/customers" class="btn btn-outline-secondary">
            <i class="bi bi-arrow-left me-1"></i> Geri
          </a>
        </div>
      </app-page-header>

      @if (customer) {
      <div class="row">
        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Firma Bilgileri</h5>
                <app-status-badge [status]="customer.status" type="customer">
                </app-status-badge>
              </div>
              <hr />
              <div class="customer-info">
                <p><strong>Firma Adı:</strong> {{ customer.companyName }}</p>
                <p><strong>Yetkili:</strong> {{ customer.name }}</p>
                <p><strong>E-posta:</strong> {{ customer.email }}</p>
                <p><strong>Telefon:</strong> {{ customer.phone }}</p>
                <p><strong>Adres:</strong> {{ customer.address }}</p>
                <p><strong>Şehir:</strong> {{ customer.city }}</p>
                <p><strong>Ülke:</strong> {{ customer.country }}</p>
                <p><strong>Sektör:</strong> {{ customer.sector || '-' }}</p>
                <p><strong>Vergi No:</strong> {{ customer.taxId || '-' }}</p>
                <p>
                  <strong>Kayıt Tarihi:</strong>
                  {{ customer.createdAt | date : 'dd.MM.yyyy' }}
                </p>
              </div>
            </div>
          </div>

          @if (customer.contactPerson) {
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">İletişim Kişisi</h5>
              <hr />
              <div class="customer-info">
                <p><strong>Ad Soyad:</strong> {{ customer.contactPerson }}</p>
                <p>
                  <strong>Ünvan:</strong>
                  {{ customer.contactPersonTitle || '-' }}
                </p>
                <p>
                  <strong>Telefon:</strong>
                  {{ customer.contactPersonPhone || '-' }}
                </p>
              </div>
            </div>
          </div>
          } @if (customer.notes) {
          <div class="card mb-4">
            <div class="card-body">
              <h5 class="card-title mb-3">Notlar</h5>
              <hr />
              <p>{{ customer.notes }}</p>
            </div>
          </div>
          }
        </div>

        <div class="col-md-8">
          <div class="card mb-4">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Fırsatlar</h5>
                <a
                  [routerLink]="['/opportunities/new']"
                  [queryParams]="{ customerId: customer.id }"
                  class="btn btn-sm btn-primary"
                >
                  <i class="bi bi-plus-circle me-1"></i> Yeni Fırsat
                </a>
              </div>
              <hr />

              @if (opportunities.length > 0) {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th>Değer</th>
                      <th>Durum</th>
                      <th>Olasılık</th>
                      <th>Kapanış Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (opportunity of opportunities; track opportunity.id) {
                    <tr
                      class="cursor-pointer"
                      (click)="navigateTo('/opportunities/' + opportunity.id)"
                    >
                      <td>{{ opportunity.title }}</td>
                      <td>
                        {{
                          opportunity.value
                            | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                      <td>
                        <app-status-badge
                          [status]="opportunity.status"
                          type="opportunity"
                        >
                        </app-status-badge>
                      </td>
                      <td>
                        <div class="progress" style="height: 10px;">
                          <div
                            class="progress-bar"
                            [ngClass]="{
                              'bg-danger': opportunity.probability < 30,
                              'bg-warning':
                                opportunity.probability >= 30 &&
                                opportunity.probability < 70,
                              'bg-success': opportunity.probability >= 70
                            }"
                            [style.width.%]="opportunity.probability"
                          ></div>
                        </div>
                        <small>{{ opportunity.probability }}%</small>
                      </td>
                      <td>
                        {{
                          opportunity.expectedCloseDate | date : 'dd.MM.yyyy'
                        }}
                      </td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
              } @else {
              <div class="text-center py-4">
                <p class="text-muted mb-0">
                  Bu müşteri için henüz fırsat bulunmuyor
                </p>
              </div>
              }
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Teklifler</h5>
                <a
                  [routerLink]="['/offers/new']"
                  [queryParams]="{ customerId: customer.id }"
                  class="btn btn-sm btn-primary"
                >
                  <i class="bi bi-plus-circle me-1"></i> Yeni Teklif
                </a>
              </div>
              <hr />

              @if (offers.length > 0) {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Teklif No</th>
                      <th>Başlık</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                      <th>Geçerlilik Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (offer of offers; track offer.id) {
                    <tr
                      class="cursor-pointer"
                      (click)="navigateTo('/offers/' + offer.id)"
                    >
                      <td>{{ offer.offerNumber }}</td>
                      <td>{{ offer.title }}</td>
                      <td>
                        {{
                          offer.totalAmount
                            | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                      <td>
                        <app-status-badge [status]="offer.status" type="offer">
                        </app-status-badge>
                      </td>
                      <td>{{ offer.validUntil | date : 'dd.MM.yyyy' }}</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
              } @else {
              <div class="text-center py-4">
                <p class="text-muted mb-0">
                  Bu müşteri için henüz teklif bulunmuyor
                </p>
              </div>
              }
            </div>
          </div>

          <div class="card mb-4">
            <div class="card-body">
              <div
                class="d-flex justify-content-between align-items-center mb-3"
              >
                <h5 class="card-title mb-0">Siparişler</h5>
                <a
                  [routerLink]="['/orders/new']"
                  [queryParams]="{ customerId: customer.id }"
                  class="btn btn-sm btn-primary"
                >
                  <i class="bi bi-plus-circle me-1"></i> Yeni Sipariş
                </a>
              </div>
              <hr />

              @if (orders.length > 0) {
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Sipariş No</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                      <th>Ödeme Durumu</th>
                      <th>Sipariş Tarihi</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of orders; track order.id) {
                    <tr
                      class="cursor-pointer"
                      (click)="navigateTo('/orders/' + order.id)"
                    >
                      <td>{{ order.orderNumber }}</td>
                      <td>
                        {{
                          order.totalAmount
                            | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                      <td>
                        <app-status-badge [status]="order.status" type="order">
                        </app-status-badge>
                      </td>
                      <td>
                        <app-status-badge
                          [status]="order.paymentStatus"
                          type="payment"
                        >
                        </app-status-badge>
                      </td>
                      <td>{{ order.orderDate | date : 'dd.MM.yyyy' }}</td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
              } @else {
              <div class="text-center py-4">
                <p class="text-muted mb-0">
                  Bu müşteri için henüz sipariş bulunmuyor
                </p>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
      } @else {
      <div class="alert alert-warning">
        Müşteri bulunamadı. <a routerLink="/customers">Müşteri listesine dön</a>
      </div>
      }
    </div>
  `,
  styles: [
    `
      .customer-info p {
        margin-bottom: 0.5rem;
      }

      .customer-info p:last-child {
        margin-bottom: 0;
      }

      .card-title {
        color: #3f51b5;
        font-weight: 600;
      }

      .table th {
        font-weight: 600;
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class CustomerDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private customerService = inject(CustomerService);
  private opportunityService = inject(OpportunityService);
  private offerService = inject(OfferService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);

  customer: Customer | undefined;
  opportunities = this.opportunityService.getOpportunities()();
  offers = this.offerService.getOffers()();
  orders = this.orderService.getOrders()();
  payments = this.paymentService.getPayments()();

  constructor() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        const customerId = +params['id'];
        this.loadCustomerData(customerId);
      }
    });
  }

  loadCustomerData(customerId: number): void {
    this.customerService.getCustomerById(customerId).subscribe({
      next: (customer) => {
        if (customer) {
          this.customer = customer;
          this.opportunities =
            this.opportunityService.getOpportunitiesByCustomerId(customerId);
          this.offers = this.offerService.getOffersByCustomerId(customerId);
        }
      },
      error: (err) => {
        console.error('Müşteri yüklenirken hata oluştu:', err);
      },
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
