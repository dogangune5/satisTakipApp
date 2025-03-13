import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location, NgClass, DatePipe } from '@angular/common';

import { OpportunityService, CustomerService } from '../../services';
import { Opportunity, Customer } from '../../models';
import { PageHeaderComponent } from '../shared';

@Component({
  selector: 'app-opportunity-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, PageHeaderComponent],
  template: `
    <div class="container">
      <app-page-header
        [title]="isEditMode ? 'Fırsat Düzenle' : 'Yeni Fırsat'"
        [subtitle]="
          isEditMode
            ? 'Fırsat bilgilerini güncelleyin'
            : 'Yeni bir satış fırsatı ekleyin'
        "
      >
        <button class="btn btn-outline-secondary me-2" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i> Geri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="opportunityForm" (ngSubmit)="onSubmit()">
            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">Temel Bilgiler</h5>

                <div class="mb-3">
                  <label for="title" class="form-label">Fırsat Başlığı *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    formControlName="title"
                    [ngClass]="{ 'is-invalid': submitted && f['title'].errors }"
                  />
                  @if (submitted && f['title'].errors) {
                  <div class="invalid-feedback">Fırsat başlığı zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="customerId" class="form-label">Müşteri *</label>
                  <select
                    class="form-select"
                    id="customerId"
                    formControlName="customerId"
                    [ngClass]="{
                      'is-invalid': submitted && f['customerId'].errors
                    }"
                  >
                    <option value="">Müşteri Seçin</option>
                    @for (customer of customers; track customer.id) {
                    <option [value]="customer.id">
                      {{ customer.companyName }}
                    </option>
                    }
                  </select>
                  @if (submitted && f['customerId'].errors) {
                  <div class="invalid-feedback">Müşteri seçimi zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="value" class="form-label">Değer (TL) *</label>
                  <input
                    type="number"
                    class="form-control"
                    id="value"
                    formControlName="value"
                    [ngClass]="{ 'is-invalid': submitted && f['value'].errors }"
                  />
                  @if (submitted && f['value'].errors) {
                  <div class="invalid-feedback">
                    @if (f['value'].errors['required']) { Değer zorunludur }
                    @else if (f['value'].errors['min']) { Değer 0'dan büyük
                    olmalıdır }
                  </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="status" class="form-label">Durum *</label>
                  <select
                    class="form-select"
                    id="status"
                    formControlName="status"
                    [ngClass]="{
                      'is-invalid': submitted && f['status'].errors
                    }"
                  >
                    <option value="new">Yeni</option>
                    <option value="qualified">Nitelikli</option>
                    <option value="proposition">Teklif Aşaması</option>
                    <option value="negotiation">Pazarlık</option>
                    <option value="closed-won">Kazanıldı</option>
                    <option value="closed-lost">Kaybedildi</option>
                  </select>
                  @if (submitted && f['status'].errors) {
                  <div class="invalid-feedback">Durum seçimi zorunludur</div>
                  }
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Detaylar</h5>

                <div class="mb-3">
                  <label for="description" class="form-label">Açıklama *</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    formControlName="description"
                    [ngClass]="{
                      'is-invalid': submitted && f['description'].errors
                    }"
                  ></textarea>
                  @if (submitted && f['description'].errors) {
                  <div class="invalid-feedback">Açıklama zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="probability" class="form-label"
                    >Olasılık (%) *</label
                  >
                  <input
                    type="range"
                    class="form-range"
                    id="probability"
                    formControlName="probability"
                    min="0"
                    max="100"
                    step="5"
                  />
                  <div class="d-flex justify-content-between">
                    <span>0%</span>
                    <span class="fw-bold"
                      >{{ opportunityForm.get('probability')?.value }}%</span
                    >
                    <span>100%</span>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="expectedCloseDate" class="form-label"
                    >Beklenen Kapanış Tarihi *</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="expectedCloseDate"
                    formControlName="expectedCloseDate"
                    [ngClass]="{
                      'is-invalid': submitted && f['expectedCloseDate'].errors
                    }"
                  />
                  @if (submitted && f['expectedCloseDate'].errors) {
                  <div class="invalid-feedback">
                    Beklenen kapanış tarihi zorunludur
                  </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="priority" class="form-label">Öncelik</label>
                  <select
                    class="form-select"
                    id="priority"
                    formControlName="priority"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">Ek Bilgiler</h5>

                <div class="mb-3">
                  <label for="assignedTo" class="form-label"
                    >Sorumlu Kişi</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="assignedTo"
                    formControlName="assignedTo"
                  />
                </div>

                <div class="mb-3">
                  <label for="source" class="form-label">Kaynak</label>
                  <input
                    type="text"
                    class="form-control"
                    id="source"
                    formControlName="source"
                    placeholder="Örn: Web Sitesi, Referans, Fuar"
                  />
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Ürünler</h5>

                <div class="mb-3">
                  <label for="products" class="form-label"
                    >İlgili Ürünler</label
                  >
                  <textarea
                    class="form-control"
                    id="products"
                    rows="3"
                    formControlName="products"
                    placeholder="Her satıra bir ürün yazın"
                  ></textarea>
                  <small class="form-text text-muted"
                    >Her satıra bir ürün yazın</small
                  >
                </div>

                <div class="mb-3">
                  <label for="notes" class="form-label">Notlar</label>
                  <textarea
                    class="form-control"
                    id="notes"
                    rows="3"
                    formControlName="notes"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="d-flex justify-content-end">
              <button
                type="button"
                class="btn btn-outline-secondary me-2"
                (click)="goBack()"
              >
                İptal
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? 'Güncelle' : 'Kaydet' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .form-label {
        font-weight: 500;
      }

      h5 {
        color: #3f51b5;
        font-weight: 600;
      }
    `,
  ],
})
export class OpportunityFormComponent {
  private fb = inject(FormBuilder);
  private opportunityService = inject(OpportunityService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  opportunityForm!: FormGroup;
  isEditMode = false;
  opportunityId?: number;
  submitted = false;
  customers: Customer[] = [];

  constructor() {
    this.initForm();
    this.customers = this.customerService.getCustomers()();

    this.route.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.opportunityId = +params['id'];
        this.loadOpportunityData();
      }
    });
  }

  get f() {
    return this.opportunityForm.controls;
  }

  initForm(): void {
    this.opportunityForm = this.fb.group({
      title: ['', Validators.required],
      customerId: ['', Validators.required],
      description: ['', Validators.required],
      value: [0, [Validators.required, Validators.min(0)]],
      status: ['new', Validators.required],
      probability: [
        30,
        [Validators.required, Validators.min(0), Validators.max(100)],
      ],
      expectedCloseDate: ['', Validators.required],
      assignedTo: [''],
      products: [''],
      notes: [''],
      source: [''],
      priority: ['medium'],
    });
  }

  loadOpportunityData(): void {
    if (this.opportunityId) {
      console.log(`Fırsat bilgileri yükleniyor, ID: ${this.opportunityId}`);
      this.opportunityService.getOpportunityById(this.opportunityId).subscribe({
        next: (opportunity) => {
          if (opportunity) {
            console.log('Fırsat bilgileri yüklendi:', opportunity);

            // Format date for input type="date"
            const expectedCloseDate = opportunity.expectedCloseDate
              ? this.formatDateForInput(opportunity.expectedCloseDate)
              : '';

            // Format products array to string
            const productsString = opportunity.products
              ? opportunity.products.join('\n')
              : '';

            // Form alanlarını fırsat verileriyle doldur
            this.opportunityForm.patchValue({
              title: opportunity.title,
              customerId: opportunity.customerId,
              description: opportunity.description,
              value: opportunity.value,
              status: opportunity.status,
              probability: opportunity.probability,
              expectedCloseDate: expectedCloseDate,
              assignedTo: opportunity.assignedTo,
              products: productsString,
              notes: opportunity.notes,
              source: opportunity.source,
              priority: opportunity.priority || 'medium',
            });
          } else {
            console.error('Fırsat bulunamadı');
            this.router.navigate(['/opportunities']);
          }
        },
        error: (err) => {
          console.error('Fırsat yüklenirken hata oluştu:', err);
          this.router.navigate(['/opportunities']);
        },
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.opportunityForm.invalid) {
      return;
    }

    // Get form values
    const formValues = this.opportunityForm.value;

    // Convert products string to array
    const products = formValues.products
      ? formValues.products.split('\n').filter((p: string) => p.trim() !== '')
      : [];

    // Get customer name for display
    const customer = this.customers.find(
      (c) => c.id === +formValues.customerId
    );
    const customerName = customer ? customer.companyName : '';

    // Prepare opportunity data
    const opportunityData: Opportunity = {
      ...formValues,
      customerId: +formValues.customerId,
      customerName,
      products,
      expectedCloseDate: new Date(formValues.expectedCloseDate),
    };

    if (this.isEditMode && this.opportunityId) {
      opportunityData.id = this.opportunityId;
      console.log('Fırsat güncelleniyor:', opportunityData);
      this.opportunityService.updateOpportunity(opportunityData).subscribe({
        next: (updatedOpportunity) => {
          console.log('Fırsat başarıyla güncellendi:', updatedOpportunity);
          this.router.navigate(['/opportunities']);
        },
        error: (err) => {
          console.error('Fırsat güncellenirken hata oluştu:', err);
        },
      });
    } else {
      console.log('Yeni fırsat ekleniyor:', opportunityData);
      this.opportunityService.addOpportunity(opportunityData).subscribe({
        next: (newOpportunity) => {
          console.log('Fırsat başarıyla eklendi:', newOpportunity);
          this.router.navigate(['/opportunities']);
        },
        error: (err) => {
          console.error('Fırsat eklenirken hata oluştu:', err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
