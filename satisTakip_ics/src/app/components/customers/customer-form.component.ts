import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location, NgClass } from '@angular/common';

import { CustomerService } from '../../services';
import { Customer } from '../../models';
import { PageHeaderComponent } from '../shared';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [ReactiveFormsModule,PageHeaderComponent, NgClass],
  template: `
    <div class="container">
      <app-page-header
        [title]="isEditMode ? 'Müşteri Düzenle' : 'Yeni Müşteri'"
        [subtitle]="
          isEditMode
            ? 'Müşteri bilgilerini güncelleyin'
            : 'Yeni bir müşteri ekleyin'
        "
      >
        <button class="btn btn-outline-secondary me-2" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i> Geri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          @if (loading) {
          <div class="d-flex justify-content-center my-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Yükleniyor...</span>
            </div>
          </div>
          } @else if (error) {
          <div class="alert alert-danger">
            {{ error }}
          </div>
          } @else {
          <form [formGroup]="customerForm" (ngSubmit)="onSubmit()">
            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">Temel Bilgiler</h5>

                <div class="mb-3">
                  <label for="companyName" class="form-label"
                    >Firma Adı *</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="companyName"
                    formControlName="companyName"
                    [ngClass]="{
                      'is-invalid': submitted && f['companyName'].errors
                    }"
                  />
                  @if (submitted && f['companyName'].errors) {
                  <div class="invalid-feedback">Firma adı zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="name" class="form-label">Yetkili Adı *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="name"
                    formControlName="name"
                    [ngClass]="{ 'is-invalid': submitted && f['name'].errors }"
                  />
                  @if (submitted && f['name'].errors) {
                  <div class="invalid-feedback">Yetkili adı zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="email" class="form-label">E-posta *</label>
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    formControlName="email"
                    [ngClass]="{ 'is-invalid': submitted && f['email'].errors }"
                  />
                  @if (submitted && f['email'].errors) {
                  <div class="invalid-feedback">
                    @if (f['email'].errors['required']) { E-posta zorunludur }
                    @else if (f['email'].errors['email']) { Geçerli bir e-posta
                    adresi giriniz }
                  </div>
                  }
                </div>

                <div class="mb-3">
                  <label for="phone" class="form-label">Telefon *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="phone"
                    formControlName="phone"
                    [ngClass]="{ 'is-invalid': submitted && f['phone'].errors }"
                  />
                  @if (submitted && f['phone'].errors) {
                  <div class="invalid-feedback">
                    Telefon numarası zorunludur
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
                    <option value="active">Aktif</option>
                    <option value="inactive">Pasif</option>
                    <option value="lead">Potansiyel</option>
                  </select>
                  @if (submitted && f['status'].errors) {
                  <div class="invalid-feedback">Durum seçimi zorunludur</div>
                  }
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Adres Bilgileri</h5>

                <div class="mb-3">
                  <label for="address" class="form-label">Adres *</label>
                  <textarea
                    class="form-control"
                    id="address"
                    rows="3"
                    formControlName="address"
                    [ngClass]="{
                      'is-invalid': submitted && f['address'].errors
                    }"
                  ></textarea>
                  @if (submitted && f['address'].errors) {
                  <div class="invalid-feedback">Adres zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="city" class="form-label">Şehir *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="city"
                    formControlName="city"
                    [ngClass]="{ 'is-invalid': submitted && f['city'].errors }"
                  />
                  @if (submitted && f['city'].errors) {
                  <div class="invalid-feedback">Şehir zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="country" class="form-label">Ülke *</label>
                  <input
                    type="text"
                    class="form-control"
                    id="country"
                    formControlName="country"
                    [ngClass]="{
                      'is-invalid': submitted && f['country'].errors
                    }"
                  />
                  @if (submitted && f['country'].errors) {
                  <div class="invalid-feedback">Ülke zorunludur</div>
                  }
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">İletişim Kişisi</h5>

                <div class="mb-3">
                  <label for="contactPerson" class="form-label"
                    >İletişim Kişisi</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="contactPerson"
                    formControlName="contactPerson"
                  />
                </div>

                <div class="mb-3">
                  <label for="contactPersonTitle" class="form-label"
                    >Ünvan</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="contactPersonTitle"
                    formControlName="contactPersonTitle"
                  />
                </div>

                <div class="mb-3">
                  <label for="contactPersonPhone" class="form-label"
                    >Telefon</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="contactPersonPhone"
                    formControlName="contactPersonPhone"
                  />
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Ek Bilgiler</h5>

                <div class="mb-3">
                  <label for="taxId" class="form-label">Vergi No</label>
                  <input
                    type="text"
                    class="form-control"
                    id="taxId"
                    formControlName="taxId"
                  />
                </div>

                <div class="mb-3">
                  <label for="sector" class="form-label">Sektör</label>
                  <input
                    type="text"
                    class="form-control"
                    id="sector"
                    formControlName="sector"
                  />
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
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="submitting"
              >
                @if (submitting) {
                <span
                  class="spinner-border spinner-border-sm me-1"
                  role="status"
                  aria-hidden="true"
                ></span>
                Kaydediliyor... } @else {
                <i class="bi bi-check-circle me-1"></i>
                {{ isEditMode ? 'Güncelle' : 'Kaydet' }}
                }
              </button>
            </div>
          </form>
          }
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  customerForm!: FormGroup;
  isEditMode = false;
  customerId?: number;
  submitted = false;
  loading = false;
  submitting = false;
  error = '';

  ngOnInit(): void {
    this.initForm();

    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.isEditMode = true;
        this.customerId = +params['id'];
        this.loadCustomerData();
      }
    });
  }

  get f() {
    return this.customerForm.controls;
  }

  initForm(): void {
    this.customerForm = this.fb.group({
      companyName: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      city: ['', Validators.required],
      country: ['', Validators.required],
      status: ['active', Validators.required],
      contactPerson: [''],
      contactPersonTitle: [''],
      contactPersonPhone: [''],
      taxId: [''],
      sector: [''],
      notes: [''],
    });
  }

  loadCustomerData(): void {
    if (this.customerId) {
      this.loading = true;
      this.customerService.getCustomerById(this.customerId).subscribe({
        next: (customer) => {
          if (customer) {
            this.customerForm.patchValue(customer);
            this.loading = false;
          } else {
            this.error = 'Müşteri bulunamadı';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Müşteri bilgileri yüklenirken bir hata oluştu';
          this.loading = false;
          console.error(err);
        },
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.customerForm.invalid) {
      return;
    }

    this.submitting = true;
    const customerData: Customer = this.customerForm.value;

    if (this.isEditMode && this.customerId) {
      customerData.id = this.customerId;
      this.customerService.updateCustomer(customerData).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/customers', this.customerId]);
        },
        error: (err) => {
          this.error = 'Müşteri güncellenirken bir hata oluştu';
          this.submitting = false;
          console.error(err);
        },
      });
    } else {
      this.customerService.addCustomer(customerData).subscribe({
        next: (newCustomer) => {
          this.submitting = false;
          this.router.navigate(['/customers', newCustomer.id]);
        },
        error: (err) => {
          this.error = 'Müşteri eklenirken bir hata oluştu';
          this.submitting = false;
          console.error(err);
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }
}
