import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OpportunityService, CustomerService } from '../../services';
import { Opportunity } from '../../models';
import {
  PageHeaderComponent,
  StatusBadgeComponent,
  ConfirmDialogComponent,
} from '../shared';

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
    ConfirmDialogComponent,
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
                  placeholder="Fırsat ara..."
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
                <option value="qualified">Nitelikli</option>
                <option value="proposition">Teklif Aşaması</option>
                <option value="negotiation">Pazarlık</option>
                <option value="closed-won">Kazanıldı</option>
                <option value="closed-lost">Kaybedildi</option>
              </select>
            </div>
          </div>

          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Müşteri</th>
                  <th>Değer</th>
                  <th>Olasılık</th>
                  <th>Durum</th>
                  <th>Beklenen Kapanış</th>
                  <th>Öncelik</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                @for (opportunity of filteredOpportunities; track
                opportunity.id) {
                <tr>
                  <td>
                    <a
                      [routerLink]="['/opportunities', opportunity.id]"
                      class="fw-bold text-decoration-none"
                    >
                      {{ opportunity.title }}
                    </a>
                  </td>
                  <td>{{ opportunity.customerName }}</td>
                  <td>
                    {{
                      opportunity.value | currency : 'TRY' : 'symbol' : '1.0-0'
                    }}
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
                        role="progressbar"
                        [style.width.%]="opportunity.probability"
                        [attr.aria-valuenow]="opportunity.probability"
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <small class="d-block mt-1 text-center"
                      >{{ opportunity.probability }}%</small
                    >
                  </td>
                  <td>
                    <app-status-badge
                      [status]="opportunity.status"
                      type="opportunity"
                    >
                    </app-status-badge>
                  </td>
                  <td>
                    {{ opportunity.expectedCloseDate | date : 'dd.MM.yyyy' }}
                  </td>
                  <td>
                    <span
                      class="badge rounded-pill"
                      [ngClass]="{
                        'bg-danger': opportunity.priority === 'high',
                        'bg-warning text-dark':
                          opportunity.priority === 'medium',
                        'bg-info text-dark': opportunity.priority === 'low'
                      }"
                    >
                      {{ getPriorityText(opportunity.priority) }}
                    </span>
                  </td>
                  <td>
                    <div class="btn-group btn-group-sm">
                      <a
                        [routerLink]="['/opportunities', opportunity.id]"
                        class="btn btn-outline-primary"
                      >
                        <i class="bi bi-eye"></i>
                      </a>
                      <a
                        [routerLink]="[
                          '/opportunities',
                          opportunity.id,
                          'edit'
                        ]"
                        class="btn btn-outline-secondary"
                      >
                        <i class="bi bi-pencil"></i>
                      </a>
                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        (click)="prepareDelete(opportunity)"
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
                      Fırsat bulunamadı
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
      modalId="deleteOpportunityModal"
      title="Fırsat Silme"
      [message]="
        '&quot;' +
        (opportunityToDelete?.title || '') +
        '&quot; fırsatını silmek istediğinizden emin misiniz?'
      "
      confirmButtonText="Sil"
      (onConfirm)="deleteOpportunity()"
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
export class OpportunityListComponent implements OnInit {
  private opportunityService = inject(OpportunityService);
  private customerService = inject(CustomerService);

  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];
  searchTerm = '';
  statusFilter = 'all';
  opportunityToDelete: Opportunity | null = null;

  constructor() {}

  ngOnInit(): void {
    this.loadOpportunities();
  }

  loadOpportunities(): void {
    console.log('Fırsatlar yükleniyor...');
    this.opportunityService.fetchOpportunities().subscribe({
      next: (opportunities) => {
        console.log('Fırsatlar yüklendi:', opportunities);
        this.opportunities = opportunities;
        this.filteredOpportunities = [...this.opportunities];
      },
      error: (err) => {
        console.error('Fırsatlar yüklenirken hata oluştu:', err);
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
    let filtered = [...this.opportunities];

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

    // Bootstrap modal'ı açmak için
    const modal = document.getElementById('deleteOpportunityModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    } else {
      console.error('Modal element bulunamadı: deleteOpportunityModal');
    }
  }

  deleteOpportunity(): void {
    if (this.opportunityToDelete && this.opportunityToDelete.id) {
      console.log(`Fırsat siliniyor, ID: ${this.opportunityToDelete.id}`);

      this.opportunityService
        .deleteOpportunity(this.opportunityToDelete.id)
        .subscribe({
          next: () => {
            console.log(
              `Fırsat başarıyla silindi: ${this.opportunityToDelete?.title}`
            );
            // Fırsat listesini yeniden yükle
            this.loadOpportunities();
            this.opportunityToDelete = null;
          },
          error: (err) => {
            console.error('Fırsat silinirken hata oluştu:', err);
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
