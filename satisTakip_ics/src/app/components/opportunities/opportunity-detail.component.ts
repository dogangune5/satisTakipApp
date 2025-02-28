import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass, CurrencyPipe } from '@angular/common';

import {
  OpportunityService,
  CustomerService,
  OfferService,
} from '../../services';
import { Opportunity, Offer } from '../../models';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

@Component({
  selector: 'app-opportunity-detail',
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
        title="Fırsat Detayı"
        [subtitle]="opportunity?.title || ''"
      >
        <div class="btn-group">
          <button
            class="btn btn-outline-secondary me-2"
            (click)="navigateTo('/opportunities')"
          >
            <i class="bi bi-arrow-left me-1"></i> Geri
          </button>
          <a
            [routerLink]="['/opportunities', opportunity?.id, 'edit']"
            class="btn btn-outline-primary me-2"
          >
            <i class="bi bi-pencil me-1"></i> Düzenle
          </a>
          <button
            class="btn btn-outline-success"
            [routerLink]="['/offers/new']"
            [queryParams]="{ opportunityId: opportunity?.id }"
          >
            <i class="bi bi-file-earmark-text me-1"></i> Teklif Oluştur
          </button>
        </div>
      </app-page-header>

      @if (opportunity) {
      <div class="row">
        <div class="col-md-8">
          <div class="card mb-4">
            <div
              class="card-header d-flex justify-content-between align-items-center"
            >
              <h5 class="mb-0">Fırsat Bilgileri</h5>
              <app-status-badge
                [status]="opportunity.status"
                type="opportunity"
              ></app-status-badge>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-md-6">
                  <h6>Temel Bilgiler</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <th>Başlık</th>
                        <td>{{ opportunity.title }}</td>
                      </tr>
                      <tr>
                        <th>Müşteri</th>
                        <td>
                          <a
                            [routerLink]="[
                              '/customers',
                              opportunity.customerId
                            ]"
                          >
                            {{ opportunity.customerName }}
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <th>Değer</th>
                        <td>
                          {{
                            opportunity.value
                              | currency : 'TRY' : 'symbol' : '1.0-0'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <th>Olasılık</th>
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
                              role="progressbar"
                              [style.width.%]="opportunity.probability"
                              [attr.aria-valuenow]="opportunity.probability"
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
                          <small class="d-block mt-1"
                            >{{ opportunity.probability }}%</small
                          >
                        </td>
                      </tr>
                      <tr>
                        <th>Beklenen Kapanış</th>
                        <td>
                          {{
                            opportunity.expectedCloseDate | date : 'dd.MM.yyyy'
                          }}
                        </td>
                      </tr>
                      <tr>
                        <th>Oluşturulma Tarihi</th>
                        <td>
                          {{ opportunity.createdAt | date : 'dd.MM.yyyy' }}
                        </td>
                      </tr>
                      @if (opportunity.updatedAt) {
                      <tr>
                        <th>Güncellenme Tarihi</th>
                        <td>
                          {{ opportunity.updatedAt | date : 'dd.MM.yyyy' }}
                        </td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
                <div class="col-md-6">
                  <h6>Detaylar</h6>
                  <table class="table table-sm">
                    <tbody>
                      <tr>
                        <th>Açıklama</th>
                        <td>{{ opportunity.description }}</td>
                      </tr>
                      <tr>
                        <th>Sorumlu Kişi</th>
                        <td>{{ opportunity.assignedTo || 'Belirtilmemiş' }}</td>
                      </tr>
                      <tr>
                        <th>Öncelik</th>
                        <td>
                          <span
                            class="badge rounded-pill"
                            [ngClass]="{
                              'bg-danger': opportunity.priority === 'high',
                              'bg-warning text-dark':
                                opportunity.priority === 'medium',
                              'bg-info text-dark':
                                opportunity.priority === 'low'
                            }"
                          >
                            {{ getPriorityText(opportunity.priority) }}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <th>Kaynak</th>
                        <td>{{ opportunity.source || 'Belirtilmemiş' }}</td>
                      </tr>
                      @if (opportunity.notes) {
                      <tr>
                        <th>Notlar</th>
                        <td>{{ opportunity.notes }}</td>
                      </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              @if (opportunity.products && opportunity.products.length > 0) {
              <div class="mt-4">
                <h6>İlgili Ürünler</h6>
                <ul class="list-group">
                  @for (product of opportunity.products; track $index) {
                  <li class="list-group-item">{{ product }}</li>
                  }
                </ul>
              </div>
              }
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="mb-0">İlgili Teklifler</h5>
            </div>
            <div class="card-body">
              @if (relatedOffers.length > 0) {
              <div class="list-group">
                @for (offer of relatedOffers; track offer.id) {
                <a
                  [routerLink]="['/offers', offer.id]"
                  class="list-group-item list-group-item-action"
                >
                  <div class="d-flex w-100 justify-content-between">
                    <h6 class="mb-1">{{ offer.title }}</h6>
                    <app-status-badge
                      [status]="offer.status"
                      type="offer"
                    ></app-status-badge>
                  </div>
                  <p class="mb-1">
                    {{
                      offer.totalAmount | currency : 'TRY' : 'symbol' : '1.0-0'
                    }}
                  </p>
                  <small
                    >Geçerlilik:
                    {{ offer.validUntil | date : 'dd.MM.yyyy' }}</small
                  >
                </a>
                }
              </div>
              } @else {
              <div class="text-center py-4">
                <i class="bi bi-file-earmark-text fs-1 text-muted"></i>
                <p class="mt-2">Bu fırsat için henüz teklif oluşturulmamış</p>
                <button
                  class="btn btn-sm btn-outline-primary"
                  [routerLink]="['/offers/new']"
                  [queryParams]="{ opportunityId: opportunity.id }"
                >
                  <i class="bi bi-plus-circle me-1"></i> Teklif Oluştur
                </button>
              </div>
              }
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Aktivite Zaman Çizelgesi</h5>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                  <div class="d-flex">
                    <div class="me-3">
                      <div class="bg-primary rounded-circle p-2 text-white">
                        <i class="bi bi-plus-circle"></i>
                      </div>
                    </div>
                    <div>
                      <p class="mb-0">Fırsat oluşturuldu</p>
                      <small class="text-muted">
                        {{ opportunity.createdAt | date : 'dd.MM.yyyy HH:mm' }}
                      </small>
                    </div>
                  </div>
                </li>
                @if (opportunity.updatedAt) {
                <li class="list-group-item">
                  <div class="d-flex">
                    <div class="me-3">
                      <div class="bg-info rounded-circle p-2 text-white">
                        <i class="bi bi-pencil"></i>
                      </div>
                    </div>
                    <div>
                      <p class="mb-0">Fırsat güncellendi</p>
                      <small class="text-muted">
                        {{ opportunity.updatedAt | date : 'dd.MM.yyyy HH:mm' }}
                      </small>
                    </div>
                  </div>
                </li>
                } @for (offer of relatedOffers; track offer.id) {
                <li class="list-group-item">
                  <div class="d-flex">
                    <div class="me-3">
                      <div class="bg-success rounded-circle p-2 text-white">
                        <i class="bi bi-file-earmark-text"></i>
                      </div>
                    </div>
                    <div>
                      <p class="mb-0">
                        <a [routerLink]="['/offers', offer.id]">{{
                          offer.title
                        }}</a>
                        teklifi oluşturuldu
                      </p>
                      <small class="text-muted">
                        {{ offer.createdAt | date : 'dd.MM.yyyy HH:mm' }}
                      </small>
                    </div>
                  </div>
                </li>
                }
              </ul>
            </div>
          </div>
        </div>
      </div>
      } @else {
      <div class="alert alert-warning">
        Fırsat bulunamadı veya yükleniyor...
      </div>
      }
    </div>
  `,
  styles: [
    `
      th {
        width: 40%;
      }

      .rounded-circle {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class OpportunityDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private opportunityService = inject(OpportunityService);
  private customerService = inject(CustomerService);
  private offerService = inject(OfferService);

  opportunity: Opportunity | undefined;
  relatedOffers: Offer[] = [];

  constructor() {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.loadOpportunityData(+params['id']);
      }
    });
  }

  loadOpportunityData(opportunityId: number): void {
    this.opportunity =
      this.opportunityService.getOpportunityById(opportunityId);

    if (this.opportunity) {
      // Get related offers
      const allOffers = this.offerService.getOffers()();
      this.relatedOffers = allOffers.filter(
        (offer) => offer.opportunityId === opportunityId
      );
    } else {
      this.router.navigate(['/opportunities']);
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }

  getPriorityText(priority?: string): string {
    switch (priority) {
      case 'high':
        return 'Yüksek';
      case 'medium':
        return 'Orta';
      case 'low':
        return 'Düşük';
      default:
        return 'Belirtilmemiş';
    }
  }
}
