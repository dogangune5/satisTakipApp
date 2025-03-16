import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OfferService } from '../../services';
import { Offer } from '../../models';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
} from '../shared';

// Bootstrap Modal için global tanımlama
declare var bootstrap: any;

@Component({
  selector: 'app-offer-list',
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
        title="Teklifler"
        subtitle="Tüm teklifleri görüntüleyin, ekleyin, düzenleyin veya silin"
      >
        <button class="btn btn-primary" routerLink="/offers/new">
          <i class="bi bi-plus-circle me-1"></i> Yeni Teklif
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
                  placeholder="Teklif ara..."
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
                <option value="draft">Taslak</option>
                <option value="sent">Gönderildi</option>
                <option value="accepted">Kabul Edildi</option>
                <option value="rejected">Reddedildi</option>
                <option value="expired">Süresi Doldu</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Teklif No</th>
                  <th>Müşteri</th>
                  <th>Başlık</th>
                  <th>Tutar</th>
                  <th>Durum</th>
                  <th>Geçerlilik</th>
                  <th>Oluşturulma</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @for (offer of filteredOffers; track offer.id) {
                <tr>
                  <td>
                    <a
                      [routerLink]="['/offers', offer.id]"
                      class="fw-bold text-decoration-none"
                    >
                      {{ offer.offerNumber }}
                    </a>
                  </td>
                  <td>{{ offer.customerName }}</td>
                  <td>{{ offer.title }}</td>
                  <td>
                    {{
                      offer.totalAmount | currency : 'TRY' : 'symbol' : '1.0-0'
                    }}
                  </td>
                  <td>
                    <app-status-badge [status]="offer.status" type="offer">
                    </app-status-badge>
                  </td>
                  <td>{{ offer.validUntil | date : 'dd.MM.yyyy' }}</td>
                  <td>{{ offer.createdAt | date : 'dd.MM.yyyy' }}</td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/offers', offer.id]"
                        class="btn btn-outline-primary"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="['/offers', offer.id, 'edit']"
                        class="btn btn-outline-secondary"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        (click)="prepareDelete(offer)"
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
                      Teklif bulunamadı
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
      modalId="deleteOfferModal"
      title="Teklif Silme"
      [message]="
        '&quot;' +
        (offerToDelete?.title || '') +
        '&quot; teklifini silmek istediğinizden emin misiniz?'
      "
      confirmButtonText="Sil"
      (onConfirm)="deleteOffer()"
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
export class OfferListComponent implements OnInit {
  private offerService = inject(OfferService);

  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  searchTerm = '';
  statusFilter = 'all';
  offerToDelete: Offer | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    console.log('Teklifler yükleniyor...');
    this.offerService.fetchOffers().subscribe({
      next: (offers) => {
        console.log('Teklifler yüklendi:', offers);
        this.offers = offers;
        this.filteredOffers = [...this.offers];
      },
      error: (err) => {
        console.error('Teklifler yüklenirken hata oluştu:', err);
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
    let filtered = [...this.offers];

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((offer) => offer.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (offer) =>
          offer.title.toLowerCase().includes(term) ||
          offer.offerNumber.toLowerCase().includes(term) ||
          offer.customerName?.toLowerCase().includes(term) ||
          (offer.description && offer.description.toLowerCase().includes(term))
      );
    }

    this.filteredOffers = filtered;
  }

  prepareDelete(offer: Offer): void {
    console.log('Silinecek teklif:', offer);
    this.offerToDelete = offer;

    // Bootstrap modal'ı açmak için
    const modal = document.getElementById('deleteOfferModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    } else {
      console.error('Modal element bulunamadı: deleteOfferModal');
    }
  }

  deleteOffer(): void {
    if (this.offerToDelete && this.offerToDelete.id) {
      console.log(`Teklif siliniyor, ID: ${this.offerToDelete.id}`);

      this.offerService.deleteOffer(this.offerToDelete.id).subscribe({
        next: () => {
          console.log(`Teklif başarıyla silindi: ${this.offerToDelete?.title}`);
          // Teklif listesini yeniden yükle
          this.loadOffers();
          this.offerToDelete = null;
        },
        error: (err) => {
          console.error('Teklif silinirken hata oluştu:', err);
        },
      });
    } else {
      console.error('Silinecek teklif seçilmedi veya ID değeri yok');
    }
  }
}
