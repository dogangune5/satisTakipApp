import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location, NgClass, DatePipe, CurrencyPipe } from '@angular/common';

import {
  OfferService,
  CustomerService,
  OpportunityService,
} from '../../services';
import { Customer, Opportunity } from '../../models';
import { PageHeaderComponent } from '../shared';

@Component({
  selector: 'app-offer-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, PageHeaderComponent],
  template: `
    <div class="container">
      <app-page-header
        [title]="isEditMode ? 'Teklif Düzenle' : 'Yeni Teklif'"
        [subtitle]="
          isEditMode
            ? 'Teklif bilgilerini güncelleyin'
            : 'Yeni bir teklif oluşturun'
        "
      >
        <button class="btn btn-outline-secondary me-2" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i> Geri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="offerForm" (ngSubmit)="onSubmit()">
            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">Temel Bilgiler</h5>

                <div class="mb-3">
                  <label for="title" class="form-label">Teklif Başlığı *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="title"
                    formControlName="title"
                    [ngClass]="{ 'is-invalid': submitted && f['title'].errors }"
                  />
                  @if (submitted && f['title'].errors) {
                  <div class="invalid-feedback">Teklif başlığı zorunludur</div>
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
                    (change)="onCustomerChange()"
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
                  <label for="opportunityId" class="form-label"
                    >İlgili Fırsat</label
                  >
                  <select
                    class="form-select"
                    id="opportunityId"
                    formControlName="opportunityId"
                  >
                    <option value="">Fırsat Seçin</option>
                    @for (opportunity of filteredOpportunities; track
                    opportunity.id) {
                    <option [value]="opportunity.id">
                      {{ opportunity.title }}
                    </option>
                    }
                  </select>
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
                    <option value="draft">Taslak</option>
                    <option value="sent">Gönderildi</option>
                    <option value="accepted">Kabul Edildi</option>
                    <option value="rejected">Reddedildi</option>
                    <option value="expired">Süresi Doldu</option>
                  </select>
                  @if (submitted && f['status'].errors) {
                  <div class="invalid-feedback">Durum seçimi zorunludur</div>
                  }
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Detaylar</h5>

                <div class="mb-3">
                  <label for="description" class="form-label">Açıklama</label>
                  <textarea
                    class="form-control"
                    id="description"
                    rows="3"
                    formControlName="description"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="validUntil" class="form-label"
                    >Geçerlilik Tarihi *</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="validUntil"
                    formControlName="validUntil"
                    [ngClass]="{
                      'is-invalid': submitted && f['validUntil'].errors
                    }"
                  />
                  @if (submitted && f['validUntil'].errors) {
                  <div class="invalid-feedback">
                    Geçerlilik tarihi zorunludur
                  </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="terms" class="form-label"
                    >Şartlar ve Koşullar</label
                  >
                  <textarea
                    class="form-control"
                    id="terms"
                    rows="3"
                    formControlName="terms"
                    placeholder="Ödeme şartları, teslimat koşulları vb."
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12">
                <h5 class="mb-3">Teklif Kalemleri</h5>
                <div class="table-responsive">
                  <table class="table table-bordered">
                    <thead class="table-light">
                      <tr>
                        <th>Ürün/Hizmet Adı *</th>
                        <th>Açıklama</th>
                        <th>Miktar *</th>
                        <th>Birim Fiyat (₺) *</th>
                        <th>İndirim (%)</th>
                        <th>KDV (%)</th>
                        <th>Toplam (₺)</th>
                        <th>İşlem</th>
                      </tr>
                    </thead>
                    <tbody formArrayName="items">
                      @for (item of items.controls; track $index) {
                      <tr [formGroupName]="$index">
                        <td>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            formControlName="productName"
                            [ngClass]="{
                              'is-invalid':
                                submitted && item.get('productName')?.errors
                            }"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            class="form-control form-control-sm"
                            formControlName="description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="quantity"
                            min="1"
                            (input)="calculateItemTotal($index)"
                            [ngClass]="{
                              'is-invalid':
                                submitted && item.get('quantity')?.errors
                            }"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="unitPrice"
                            min="0"
                            (input)="calculateItemTotal($index)"
                            [ngClass]="{
                              'is-invalid':
                                submitted && item.get('unitPrice')?.errors
                            }"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="discount"
                            min="0"
                            max="100"
                            (input)="calculateItemTotal($index)"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="tax"
                            min="0"
                            (input)="calculateItemTotal($index)"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="total"
                            readonly
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-danger"
                            (click)="removeItem($index)"
                          >
                            <i class="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                      }
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colspan="8">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-primary"
                            (click)="addItem()"
                          >
                            <i class="bi bi-plus-circle me-1"></i> Kalem Ekle
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="6" class="text-end fw-bold">
                          Toplam Tutar:
                        </td>
                        <td>
                          <input
                            type="number"
                            class="form-control form-control-sm"
                            formControlName="totalAmount"
                            readonly
                          />
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
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
export class OfferFormComponent {
  private fb = inject(FormBuilder);
  private offerService = inject(OfferService);
  private customerService = inject(CustomerService);
  private opportunityService = inject(OpportunityService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  offerForm!: FormGroup;
  isEditMode = false;
  offerId?: number;
  submitted = false;
  customers: Customer[] = [];
  opportunities: Opportunity[] = [];
  filteredOpportunities: Opportunity[] = [];

  constructor() {
    this.initForm();
    this.customers = this.customerService.getCustomers()();
    this.opportunities = this.opportunityService.getOpportunities()();

    this.route.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.offerId = +params['id'];
        this.loadOfferData();
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['opportunityId']) {
        const opportunityId = +queryParams['opportunityId'];

        this.opportunityService.getOpportunityById(opportunityId).subscribe({
          next: (opportunity) => {
            if (opportunity) {
              this.offerForm.patchValue({
                opportunityId,
                customerId: opportunity.customerId,
                title: `Teklif: ${opportunity.title}`,
              });

              this.onCustomerChange();
            }
          },
          error: (err) => {
            console.error('Fırsat bilgisi alınırken hata oluştu:', err);
          },
        });
      }
    });
  }

  get f() {
    return this.offerForm.controls;
  }

  get items() {
    return this.offerForm.get('items') as FormArray;
  }

  initForm(): void {
    this.offerForm = this.fb.group({
      title: ['', Validators.required],
      customerId: ['', Validators.required],
      description: [''],
      items: this.fb.array([this.createItem()]),
      totalAmount: [0],
      status: ['draft', Validators.required],
      validUntil: [this.getDefaultValidUntil(), Validators.required],
      notes: [''],
      terms: [''],
      opportunityId: [''],
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      discount: [0],
      tax: [18],
      total: [0],
      description: [''],
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    if (this.items.length > 1) {
      this.items.removeAt(index);
      this.calculateTotalAmount();
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index) as FormGroup;
    const quantity = item.get('quantity')?.value || 0;
    const unitPrice = item.get('unitPrice')?.value || 0;
    const discount = item.get('discount')?.value || 0;
    const tax = item.get('tax')?.value || 0;

    // Calculate price after discount
    const priceAfterDiscount = unitPrice * (1 - discount / 100);

    // Calculate total with tax
    const total = quantity * priceAfterDiscount * (1 + tax / 100);

    item.get('total')?.setValue(parseFloat(total.toFixed(2)));

    this.calculateTotalAmount();
  }

  calculateTotalAmount(): void {
    let total = 0;
    for (let i = 0; i < this.items.length; i++) {
      const itemTotal = this.items.at(i).get('total')?.value || 0;
      total += itemTotal;
    }
    this.offerForm.get('totalAmount')?.setValue(parseFloat(total.toFixed(2)));
  }

  loadOfferData(): void {
    if (this.offerId) {
      console.log(`Teklif bilgileri yükleniyor, ID: ${this.offerId}`);
      this.offerService.getOfferById(this.offerId).subscribe({
        next: (offer) => {
          if (offer) {
            console.log('Teklif bilgileri yüklendi:', offer);

            // Clear existing items
            while (this.items.length) {
              this.items.removeAt(0);
            }

            // Add offer items
            offer.items.forEach((item) => {
              this.items.push(
                this.fb.group({
                  productName: [item.productName, Validators.required],
                  quantity: [
                    item.quantity,
                    [Validators.required, Validators.min(1)],
                  ],
                  unitPrice: [
                    item.unitPrice,
                    [Validators.required, Validators.min(0)],
                  ],
                  discount: [item.discount || 0],
                  tax: [item.tax || 18],
                  total: [item.total],
                  description: [item.description || ''],
                })
              );
            });

            // Format date for input type="date"
            const validUntil = offer.validUntil
              ? this.formatDateForInput(offer.validUntil)
              : '';

            // Set other form values
            this.offerForm.patchValue({
              title: offer.title,
              customerId: offer.customerId,
              description: offer.description,
              totalAmount: offer.totalAmount,
              status: offer.status,
              validUntil,
              notes: offer.notes,
              terms: offer.terms,
              opportunityId: offer.opportunityId,
            });

            this.onCustomerChange();
          } else {
            console.error('Teklif bulunamadı');
            this.router.navigate(['/offers']);
          }
        },
        error: (err) => {
          console.error('Teklif yüklenirken hata oluştu:', err);
          this.router.navigate(['/offers']);
        },
      });
    }
  }

  onCustomerChange(): void {
    const customerId = this.offerForm.get('customerId')?.value;
    if (customerId) {
      // Müşteriye ait fırsatları filtrele
      this.opportunityService
        .getOpportunitiesByCustomerId(+customerId)
        .subscribe({
          next: (opportunities) => {
            this.filteredOpportunities = opportunities;
          },
          error: (err) => {
            console.error(
              'Müşteriye ait fırsatlar getirilirken hata oluştu:',
              err
            );
            this.filteredOpportunities = [];
          },
        });
    } else {
      this.filteredOpportunities = [];
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.offerForm.invalid) {
      return;
    }

    // Get form values
    const formValues = this.offerForm.value;

    // Get customer name for display
    const customer = this.customers.find(
      (c) => c.id === +formValues.customerId
    );
    const customerName = customer ? customer.companyName : '';

    // Prepare offer data
    const offerData = {
      ...formValues,
      customerId: +formValues.customerId,
      customerName,
      validUntil: new Date(formValues.validUntil),
      opportunityId: formValues.opportunityId
        ? +formValues.opportunityId
        : undefined,
    };

    if (this.isEditMode && this.offerId) {
      offerData.id = this.offerId;
      console.log('Teklif güncelleniyor:', offerData);
      this.offerService.updateOffer(offerData).subscribe({
        next: (updatedOffer) => {
          console.log('Teklif başarıyla güncellendi:', updatedOffer);
          this.router.navigate(['/offers']);
        },
        error: (err) => {
          console.error('Teklif güncellenirken hata oluştu:', err);
        },
      });
    } else {
      console.log('Yeni teklif ekleniyor:', offerData);
      this.offerService.addOffer(offerData).subscribe({
        next: (newOffer) => {
          console.log('Teklif başarıyla eklendi:', newOffer);
          this.router.navigate(['/offers']);
        },
        error: (err) => {
          console.error('Teklif eklenirken hata oluştu:', err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  private getDefaultValidUntil(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default validity: 30 days
    return this.formatDateForInput(date);
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
