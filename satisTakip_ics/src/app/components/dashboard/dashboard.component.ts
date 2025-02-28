import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';

import {
  CustomerService,
  OpportunityService,
  OfferService,
  OrderService,
  PaymentService,
} from '../../services';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-dashboard',
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
        title="Dashboard"
        subtitle="Satış takip sistemi genel bakış"
      >
      </app-page-header>

      <div class="row mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Toplam Müşteri</h6>
                  <h2 class="mb-0">{{ customerCount }}</h2>
                </div>
                <div>
                  <i class="bi bi-people dashboard-icon"></i>
                </div>
              </div>
              <div class="mt-3">
                <a
                  routerLink="/customers"
                  class="text-white text-decoration-none small"
                >
                  Tümünü Görüntüle <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Açık Fırsatlar</h6>
                  <h2 class="mb-0">{{ openOpportunityCount }}</h2>
                </div>
                <div>
                  <i class="bi bi-lightning dashboard-icon"></i>
                </div>
              </div>
              <div class="mt-3">
                <a
                  routerLink="/opportunities"
                  class="text-white text-decoration-none small"
                >
                  Tümünü Görüntüle <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-info">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Bekleyen Teklifler</h6>
                  <h2 class="mb-0">{{ pendingOfferCount }}</h2>
                </div>
                <div>
                  <i class="bi bi-file-earmark-text dashboard-icon"></i>
                </div>
              </div>
              <div class="mt-3">
                <a
                  routerLink="/offers"
                  class="text-white text-decoration-none small"
                >
                  Tümünü Görüntüle <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="card-title">Aktif Siparişler</h6>
                  <h2 class="mb-0">{{ activeOrderCount }}</h2>
                </div>
                <div>
                  <i class="bi bi-cart dashboard-icon"></i>
                </div>
              </div>
              <div class="mt-3">
                <a
                  routerLink="/orders"
                  class="text-white text-decoration-none small"
                >
                  Tümünü Görüntüle <i class="bi bi-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Son Fırsatlar</h5>
                <a routerLink="/opportunities" class="btn btn-sm btn-primary">
                  <i class="bi bi-plus-circle me-1"></i> Yeni Fırsat
                </a>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Başlık</th>
                      <th>Müşteri</th>
                      <th>Değer</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (opportunity of recentOpportunities; track
                    opportunity.id) {
                    <tr
                      class="cursor-pointer"
                      [routerLink]="['/opportunities', opportunity.id]"
                    >
                      <td>{{ opportunity.title }}</td>
                      <td>{{ opportunity.customerName }}</td>
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
                    </tr>
                    } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-3">
                        Henüz fırsat bulunmuyor
                      </td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="card h-100">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Son Siparişler</h5>
                <a routerLink="/orders" class="btn btn-sm btn-primary">
                  <i class="bi bi-plus-circle me-1"></i> Yeni Sipariş
                </a>
              </div>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Sipariş No</th>
                      <th>Müşteri</th>
                      <th>Tutar</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (order of recentOrders; track order.id) {
                    <tr
                      class="cursor-pointer"
                      [routerLink]="['/orders', order.id]"
                    >
                      <td>{{ order.orderNumber }}</td>
                      <td>{{ order.customerName }}</td>
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
                    </tr>
                    } @empty {
                    <tr>
                      <td colspan="4" class="text-center py-3">
                        Henüz sipariş bulunmuyor
                      </td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Fırsat Durumları</h5>
            </div>
            <div class="card-body">
              <div class="opportunity-stats">
                @for (stat of opportunityStats; track stat.status) {
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <div>
                    <app-status-badge [status]="stat.status" type="opportunity">
                    </app-status-badge>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold">{{ stat.count }}</div>
                    <div class="small text-muted">
                      {{ stat.value | currency : 'TRY' : 'symbol' : '1.0-0' }}
                    </div>
                  </div>
                </div>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Son Teklifler</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Teklif No</th>
                      <th>Müşteri</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (offer of recentOffers; track offer.id) {
                    <tr
                      class="cursor-pointer"
                      [routerLink]="['/offers', offer.id]"
                    >
                      <td>{{ offer.offerNumber }}</td>
                      <td>{{ offer.customerName }}</td>
                      <td>
                        <app-status-badge [status]="offer.status" type="offer">
                        </app-status-badge>
                      </td>
                    </tr>
                    } @empty {
                    <tr>
                      <td colspan="3" class="text-center py-3">
                        Henüz teklif bulunmuyor
                      </td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-header bg-light">
              <h5 class="mb-0">Son Ödemeler</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Ödeme No</th>
                      <th>Tutar</th>
                      <th>Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (payment of recentPayments; track payment.id) {
                    <tr
                      class="cursor-pointer"
                      [routerLink]="['/payments', payment.id]"
                    >
                      <td>{{ payment.paymentNumber }}</td>
                      <td>
                        {{
                          payment.amount | currency : 'TRY' : 'symbol' : '1.0-0'
                        }}
                      </td>
                      <td>{{ payment.paymentDate | date : 'dd.MM.yyyy' }}</td>
                    </tr>
                    } @empty {
                    <tr>
                      <td colspan="3" class="text-center py-3">
                        Henüz ödeme bulunmuyor
                      </td>
                    </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-icon {
        font-size: 2.5rem;
        opacity: 0.7;
      }

      .card {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transition: all 0.3s ease;
      }

      .card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
      }

      .card-header {
        font-weight: 600;
      }

      .table th {
        font-weight: 600;
        background-color: #f8f9fa;
      }
    `,
  ],
})
export class DashboardComponent {
  private customerService = inject(CustomerService);
  private opportunityService = inject(OpportunityService);
  private offerService = inject(OfferService);
  private orderService = inject(OrderService);
  private paymentService = inject(PaymentService);

  customers = this.customerService.getCustomers()();
  opportunities = this.opportunityService.getOpportunities()();
  offers = this.offerService.getOffers()();
  orders = this.orderService.getOrders()();
  payments = this.paymentService.getPayments()();

  // Dashboard metrics
  customerCount = this.customers.length;
  openOpportunityCount = this.opportunities.filter(
    (o) => o.status !== 'closed-won' && o.status !== 'closed-lost'
  ).length;
  pendingOfferCount = this.offers.filter(
    (o) => o.status === 'sent' || o.status === 'draft'
  ).length;
  activeOrderCount = this.orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  // Recent items
  recentOpportunities = [...this.opportunities]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  recentOrders = [...this.orders]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  recentOffers = [...this.offers]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  recentPayments = [...this.payments]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  // Opportunity statistics
  opportunityStats = [
    {
      status: 'new',
      count: this.opportunities.filter((o) => o.status === 'new').length,
      value: this.opportunities
        .filter((o) => o.status === 'new')
        .reduce((sum, o) => sum + o.value, 0),
    },
    {
      status: 'qualified',
      count: this.opportunities.filter((o) => o.status === 'qualified').length,
      value: this.opportunities
        .filter((o) => o.status === 'qualified')
        .reduce((sum, o) => sum + o.value, 0),
    },
    {
      status: 'proposition',
      count: this.opportunities.filter((o) => o.status === 'proposition')
        .length,
      value: this.opportunities
        .filter((o) => o.status === 'proposition')
        .reduce((sum, o) => sum + o.value, 0),
    },
    {
      status: 'negotiation',
      count: this.opportunities.filter((o) => o.status === 'negotiation')
        .length,
      value: this.opportunities
        .filter((o) => o.status === 'negotiation')
        .reduce((sum, o) => sum + o.value, 0),
    },
    {
      status: 'closed-won',
      count: this.opportunities.filter((o) => o.status === 'closed-won').length,
      value: this.opportunities
        .filter((o) => o.status === 'closed-won')
        .reduce((sum, o) => sum + o.value, 0),
    },
    {
      status: 'closed-lost',
      count: this.opportunities.filter((o) => o.status === 'closed-lost')
        .length,
      value: this.opportunities
        .filter((o) => o.status === 'closed-lost')
        .reduce((sum, o) => sum + o.value, 0),
    },
  ];
}
