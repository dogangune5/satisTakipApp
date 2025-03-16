import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, CurrencyPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OpportunityService, CustomerService } from '../../services';
import { Opportunity } from '../../models';
import { PageHeaderComponent, StatusBadgeComponent } from '../shared';

// Bootstrap Modal için global tanımlama
declare var bootstrap: any;

@Component({
  selector: 'app-opportunity-list',
  standalone: true,
  imports: [
    RouterLink,
    NgClass,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent,
    CommonModule,
  ],
  template: `
    <div class="container">
      <app-page-header
        title="Fırsatlar"
        subtitle="Tüm satış fırsatlarını görüntüleyin, ekleyin, düzenleyin veya silin"
      >
        <button class="btn btn-primary" routerLink="/opportunities/new">
          <i class="bi bi-plus-circle me-1"></i> Yeni Fırsat
        </button>
      </app-page-header>

      <!-- Hata mesajı -->
      @if (errorMessage) {
      <div class="alert alert-warning alert-dismissible fade show" role="alert">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        {{ errorMessage }}
        <button
          type="button"
          class="btn-close"
          (click)="errorMessage = ''"
        ></button>
      </div>
      }

      <!-- Yükleniyor göstergesi -->
      @if (isLoading) {
      <div class="d-flex justify-content-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
      } @else {
      <!-- Filtreler -->
      <div class="row mb-4">
        <div class="col-md-6 mb-3 mb-md-0">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Fırsat ara..."
              [(ngModel)]="searchTerm"
              (input)="applyFilters()"
            />
            @if (searchTerm) {
            <button
              class="btn btn-outline-secondary"
              type="button"
              (click)="searchTerm = ''; applyFilters()"
            >
              <i class="bi bi-x-lg"></i>
            </button>
            }
          </div>
        </div>
        <div class="col-md-6">
          <div class="d-flex gap-2">
            <select
              class="form-select"
              [(ngModel)]="statusFilter"
              (change)="applyFilters()"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="new">Yeni</option>
              <option value="qualified">Nitelikli</option>
              <option value="proposal">Teklif Aşamasında</option>
              <option value="negotiation">Görüşme Aşamasında</option>
              <option value="closed-won">Kazanıldı</option>
              <option value="closed-lost">Kaybedildi</option>
            </select>
            <select
              class="form-select"
              [(ngModel)]="priorityFilter"
              (change)="applyFilters()"
            >
              <option value="all">Tüm Öncelikler</option>
              <option value="high">Yüksek</option>
              <option value="medium">Orta</option>
              <option value="low">Düşük</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Fırsat listesi -->
      @if (filteredOpportunities.length === 0) {
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        @if (searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') {
        Filtrelere uygun fırsat bulunamadı. Filtreleri değiştirmeyi deneyin. }
        @else { Henüz fırsat kaydı bulunmuyor. "Yeni Fırsat" butonuna tıklayarak
        ilk fırsatınızı ekleyebilirsiniz. }
      </div>
      } @else {
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Başlık</th>
              <th>Müşteri</th>
              <th>Değer</th>
              <th>Durum</th>
              <th>Öncelik</th>
              <th>Kapanış Tarihi</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            @for (opportunity of filteredOpportunities; track opportunity.id) {
            <tr>
              <td>
                <a
                  [routerLink]="['/opportunities', opportunity.id]"
                  class="text-decoration-none"
                >
                  {{ opportunity.title }}
                </a>
              </td>
              <td>
                <a
                  *ngIf="opportunity.customerId"
                  [routerLink]="['/customers', opportunity.customerId]"
                  class="text-decoration-none"
                >
                  {{ opportunity.customerName || 'İsimsiz Müşteri' }}
                </a>
                <span *ngIf="!opportunity.customerId">-</span>
              </td>
              <td>{{ opportunity.value | currency : 'TRY' : 'symbol' }}</td>
              <td>
                <app-status-badge
                  [status]="opportunity.status"
                  [type]="'opportunity'"
                ></app-status-badge>
              </td>
              <td>
                <span
                  class="badge"
                  [ngClass]="{
                    'text-bg-danger': opportunity.priority === 'high',
                    'text-bg-warning': opportunity.priority === 'medium',
                    'text-bg-success': opportunity.priority === 'low',
                    'text-bg-secondary': !opportunity.priority
                  }"
                >
                  {{ getPriorityText(opportunity.priority) }}
                </span>
              </td>
              <td>
                {{
                  opportunity.expectedCloseDate | date : 'dd.MM.yyyy' : 'tr-TR'
                }}
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <a
                    [routerLink]="['/opportunities', opportunity.id]"
                    class="btn btn-outline-primary"
                    title="Görüntüle"
                  >
                    <i class="bi bi-eye"></i>
                  </a>
                  <a
                    [routerLink]="['/opportunities', opportunity.id, 'edit']"
                    class="btn btn-outline-secondary"
                    title="Düzenle"
                  >
                    <i class="bi bi-pencil"></i>
                  </a>
                  <button
                    class="btn btn-outline-danger"
                    title="Sil"
                    (click)="prepareDelete(opportunity)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      } }
    </div>

    <!-- Silme Onay Modal -->
    <div
      class="modal fade"
      id="deleteOpportunityModal"
      tabindex="-1"
      aria-labelledby="deleteOpportunityModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="deleteOpportunityModalLabel">
              Fırsat Silme Onayı
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Kapat"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              <strong>{{ opportunityToDelete?.title }}</strong> başlıklı fırsatı
              silmek istediğinize emin misiniz?
            </p>
            <p class="text-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>
              Bu işlem geri alınamaz ve fırsata bağlı tüm veriler silinecektir.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              İptal
            </button>
            <button
              type="button"
              class="btn btn-danger"
              [disabled]="isDeleting"
              (click)="deleteOpportunity()"
            >
              @if (isDeleting) {
              <span
                class="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Siliniyor... } @else {
              <i class="bi bi-trash me-2"></i>
              Sil }
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class OpportunityListComponent implements OnInit {
  private opportunityService = inject(OpportunityService);
  private customerService = inject(CustomerService);

  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];
  opportunityToDelete: Opportunity | null = null;

  // Yükleme ve silme durumları
  isLoading = false;
  isDeleting = false;
  errorMessage = '';

  // Filtreler
  searchTerm = '';
  statusFilter = 'all';
  priorityFilter = 'all';

  // Modal referansı
  private deleteModal: any;

  ngOnInit(): void {
    this.loadOpportunities();
  }

  loadOpportunities(): void {
    console.log('Fırsatlar yükleniyor...');
    this.isLoading = true;
    this.errorMessage = '';

    this.opportunityService.fetchOpportunities().subscribe({
      next: (opportunities) => {
        console.log('Fırsatlar başarıyla yüklendi:', opportunities);
        this.opportunities = opportunities;
        this.enrichOpportunities();
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fırsatlar yüklenirken hata oluştu:', error);
        this.errorMessage = `Fırsatlar yüklenirken bir hata oluştu: ${
          error.message || 'Bilinmeyen hata'
        }`;
        this.isLoading = false;
      },
    });
  }

  // Fırsatları müşteri bilgileriyle zenginleştir
  enrichOpportunities(): void {
    // Benzersiz müşteri ID'lerini topla
    const customerIds = [
      ...new Set(
        this.opportunities
          .filter((o) => o.customerId)
          .map((o) => o.customerId as number)
      ),
    ];

    if (customerIds.length === 0) {
      return;
    }

    // Her bir müşteri için bilgileri getir
    customerIds.forEach((customerId) => {
      this.customerService.getCustomerById(customerId).subscribe({
        next: (customer) => {
          if (customer) {
            // İlgili fırsatları güncelle
            this.opportunities = this.opportunities.map((opportunity) => {
              if (opportunity.customerId === customerId) {
                return {
                  ...opportunity,
                  customerName: customer.companyName || 'İsimsiz Müşteri',
                };
              }
              return opportunity;
            });
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error(
            `Müşteri ID:${customerId} bilgileri getirilirken hata oluştu:`,
            error
          );
        },
      });
    });
  }

  applyFilters(): void {
    let filtered = [...this.opportunities];

    // Apply priority filter
    if (this.priorityFilter !== 'all') {
      filtered = filtered.filter(
        (opportunity) => opportunity.priority === this.priorityFilter
      );
    }

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(
        (opportunity) => opportunity.status === this.statusFilter
      );
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (opportunity) =>
          opportunity.title.toLowerCase().includes(term) ||
          opportunity.description.toLowerCase().includes(term) ||
          opportunity.customerName?.toLowerCase().includes(term) ||
          opportunity.assignedTo?.toLowerCase().includes(term)
      );
    }

    this.filteredOpportunities = filtered;
  }

  prepareDelete(opportunity: Opportunity): void {
    console.log('Silinecek fırsat:', opportunity);
    this.opportunityToDelete = opportunity;
    this.errorMessage = '';

    // Bootstrap modal'ı açmak için
    const modal = document.getElementById('deleteOpportunityModal');
    if (modal) {
      this.deleteModal = new bootstrap.Modal(modal);
      this.deleteModal.show();
    } else {
      console.error('Modal element bulunamadı: deleteOpportunityModal');
    }
  }

  deleteOpportunity(): void {
    if (this.opportunityToDelete && this.opportunityToDelete.id) {
      console.log(`Fırsat siliniyor, ID: ${this.opportunityToDelete.id}`);
      this.errorMessage = '';
      this.isDeleting = true;

      this.opportunityService
        .deleteOpportunity(this.opportunityToDelete.id)
        .subscribe({
          next: () => {
            console.log(
              `Fırsat başarıyla silindi: ${this.opportunityToDelete?.title}`
            );
            // Modal'ı kapat
            if (this.deleteModal) {
              this.deleteModal.hide();
            }
            // Fırsat listesini yeniden yükle
            this.loadOpportunities();
            this.opportunityToDelete = null;
            this.isDeleting = false;
          },
          error: (err) => {
            console.error('Fırsat silinirken hata oluştu:', err);

            // Modal'ı kapat
            if (this.deleteModal) {
              this.deleteModal.hide();
            }

            // İlişkisel veritabanı hatası için özel mesaj
            if (err.message && err.message.includes('bağlı teklifler')) {
              this.errorMessage = err.message;
            } else {
              this.errorMessage = `Fırsat silinirken bir hata oluştu: ${
                err.message || 'Bilinmeyen hata'
              }`;
            }

            this.opportunityToDelete = null;
            this.isDeleting = false;
          },
        });
    } else {
      console.error('Silinecek fırsat seçilmedi veya ID değeri yok');
    }
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
