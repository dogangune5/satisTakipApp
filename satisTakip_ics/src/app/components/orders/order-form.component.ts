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

import { OrderService, CustomerService, OfferService } from '../../services';
import { Customer, Offer } from '../../models';
import { PageHeaderComponent } from '../shared';

@Component({
  selector: 'app-order-form',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, PageHeaderComponent],
  template: `
    <div class="container">
      <app-page-header
        [title]="isEditMode ? 'Sipariş Düzenle' : 'Yeni Sipariş'"
        [subtitle]="
          isEditMode
            ? 'Sipariş bilgilerini güncelleyin'
            : 'Yeni bir sipariş oluşturun'
        "
      >
        <button class="btn btn-outline-secondary me-2" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i> Geri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()">
            <div class="row mb-3">
              <div class="col-md-6">
                <h5 class="mb-3">Temel Bilgiler</h5>

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
                      {{ customer.name }}
                    </option>
                    }
                  </select>
                  @if (submitted && f['customerId'].errors) {
                  <div class="invalid-feedback">Müşteri seçimi zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="offerId" class="form-label">İlgili Teklif</label>
                  <select
                    class="form-select"
                    id="offerId"
                    formControlName="offerId"
                    (change)="onOfferChange()"
                  >
                    <option value="">Teklif Seçin</option>
                    @for (offer of filteredOffers; track offer.id) {
                    <option [value]="offer.id">{{ offer.title }}</option>
                    }
                  </select>
                </div>

                <div class="mb-3">
                  <label for="orderDate" class="form-label"
                    >Sipariş Tarihi *</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="orderDate"
                    formControlName="orderDate"
                    [ngClass]="{
                      'is-invalid': submitted && f['orderDate'].errors
                    }"
                  />
                  @if (submitted && f['orderDate'].errors) {
                  <div class="invalid-feedback">Sipariş tarihi zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="deliveryDate" class="form-label"
                    >Teslimat Tarihi</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="deliveryDate"
                    formControlName="deliveryDate"
                  />
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Durum ve Adres Bilgileri</h5>

                <div class="mb-3">
                  <label for="status" class="form-label"
                    >Sipariş Durumu *</label
                  >
                  <select
                    class="form-select"
                    id="status"
                    formControlName="status"
                    [ngClass]="{
                      'is-invalid': submitted && f['status'].errors
                    }"
                  >
                    <option value="new">Yeni</option>
                    <option value="processing">İşleniyor</option>
                    <option value="shipped">Gönderildi</option>
                    <option value="delivered">Teslim Edildi</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                  @if (submitted && f['status'].errors) {
                  <div class="invalid-feedback">Sipariş durumu zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="paymentStatus" class="form-label"
                    >Ödeme Durumu *</label
                  >
                  <select
                    class="form-select"
                    id="paymentStatus"
                    formControlName="paymentStatus"
                    [ngClass]="{
                      'is-invalid': submitted && f['paymentStatus'].errors
                    }"
                  >
                    <option value="pending">Bekliyor</option>
                    <option value="partial">Kısmi Ödeme</option>
                    <option value="paid">Ödendi</option>
                  </select>
                  @if (submitted && f['paymentStatus'].errors) {
                  <div class="invalid-feedback">Ödeme durumu zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="shippingAddress" class="form-label"
                    >Teslimat Adresi</label
                  >
                  <textarea
                    class="form-control"
                    id="shippingAddress"
                    rows="2"
                    formControlName="shippingAddress"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="billingAddress" class="form-label"
                    >Fatura Adresi</label
                  >
                  <textarea
                    class="form-control"
                    id="billingAddress"
                    rows="2"
                    formControlName="billingAddress"
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-12">
                <h5 class="mb-3">Sipariş Kalemleri</h5>
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
export class OrderFormComponent {
  private fb = inject(FormBuilder);
  private orderService = inject(OrderService);
  private customerService = inject(CustomerService);
  private offerService = inject(OfferService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  orderForm!: FormGroup;
  isEditMode = false;
  orderId?: number;
  submitted = false;
  customers: Customer[] = [];
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];

  constructor() {
    this.initForm();
    this.loadData();

    this.route.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.orderId = +params['id'];
        this.loadOrderData(this.orderId);
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['offerId']) {
        const offerId = +queryParams['offerId'];
        this.handleOfferSelection(offerId);
      }
    });
  }

  loadData(): void {
    // Müşterileri yükle
    this.customerService.fetchCustomers().subscribe({
      next: (customers) => {
        this.customers = customers;
        console.log('Müşteriler yüklendi:', this.customers);
      },
      error: (err) => console.error('Müşteriler yüklenirken hata oluştu:', err)
    });

    // Teklifleri yükle
    this.offerService.fetchOffers().subscribe({
      next: (offers) => {
        this.offers = offers;
        console.log('Teklifler yüklendi:', this.offers);
        
        // URL'den gelen teklif ID'si varsa işle
        const offerId = this.route.snapshot.queryParams['offerId'];
        if (offerId) {
          this.handleOfferSelection(+offerId);
        }
      },
      error: (err) => console.error('Teklifler yüklenirken hata oluştu:', err)
    });
  }

  handleOfferSelection(offerId: number): void {
    // Önce mevcut tekliflerde arayalım
    const existingOffer = this.offers.find((o) => o.id === offerId);

    if (existingOffer) {
      // Eğer teklif zaten yüklenmişse, doğrudan kullan
      this.orderForm.patchValue({
        offerId,
        customerId: existingOffer.customerId,
      });

      this.onCustomerChange();
      this.populateItemsFromOffer(existingOffer);
    } else {
      // Değilse API'den getir
      this.offerService.getOfferById(offerId).subscribe({
        next: (offer) => {
          if (!offer) return;

          this.orderForm.patchValue({
            offerId,
            customerId: offer.customerId,
          });

          this.onCustomerChange();
          this.populateItemsFromOffer(offer);
        },
        error: (err) => {
          console.error('Teklif bilgileri alınırken hata oluştu:', err);
        },
      });
    }
  }

  get f() {
    return this.orderForm.controls;
  }

  get items() {
    return this.orderForm.get('items') as FormArray;
  }

  initForm(): void {
    this.orderForm = this.fb.group({
      customerId: ['', Validators.required],
      customerName: [''],
      items: this.fb.array([this.createItem()]),
      totalAmount: [0],
      status: ['new', Validators.required],
      paymentStatus: ['pending', Validators.required],
      orderDate: [this.formatDateForInput(new Date()), Validators.required],
      deliveryDate: [''],
      notes: [''],
      shippingAddress: [''],
      billingAddress: [''],
      offerId: [''],
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

  addItem(item?: any): void {
    this.items.push(
      this.fb.group({
        id: [item?.id || null],
        productName: [item?.productName || '', Validators.required],
        quantity: [
          item?.quantity || 1,
          [Validators.required, Validators.min(1)],
        ],
        unitPrice: [
          item?.unitPrice || 0,
          [Validators.required, Validators.min(0)],
        ],
        discount: [item?.discount || 0],
        tax: [item?.tax || 18],
        total: [item?.total || 0],
        description: [item?.description || ''],
      })
    );

    this.calculateTotalAmount();
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
    this.orderForm.get('totalAmount')?.setValue(parseFloat(total.toFixed(2)));
  }

  loadOrderData(orderId: number): void {
    console.log(`Sipariş bilgileri yükleniyor, ID: ${orderId}`);
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        if (order) {
          console.log('Sipariş bilgileri yüklendi:', order);

          // Clear existing items
          while (this.items.length > 0) {
            this.items.removeAt(0);
          }

          // Add items from the order
          if (order.items && order.items.length > 0) {
            order.items.forEach((item) => {
              this.addItem(item);
            });
          }

          // Format dates for input fields
          const orderDate = order.orderDate
            ? this.formatDateForInput(new Date(order.orderDate))
            : '';

          const deliveryDate = order.deliveryDate
            ? this.formatDateForInput(new Date(order.deliveryDate))
            : '';

          // Patch form values
          this.orderForm.patchValue({
            orderNumber: order.orderNumber,
            customerId: order.customerId,
            customerName: order.customerName,
            offerId: order.offerId,
            status: order.status,
            orderDate: orderDate,
            deliveryDate: deliveryDate,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            paymentStatus: order.paymentStatus,
            notes: order.notes,
          });

          // Müşteri değişikliğini tetikle
          this.onCustomerChange();

          // Calculate total amount
          this.calculateTotalAmount();
        } else {
          console.error('Sipariş bulunamadı');
          this.router.navigate(['/orders']);
        }
      },
      error: (err) => {
        console.error('Sipariş yüklenirken hata oluştu:', err);
        this.router.navigate(['/orders']);
      },
    });
  }

  onCustomerChange(): void {
    const customerId = +this.orderForm.get('customerId')?.value;
    if (customerId) {
      // Tüm teklifleri filtrele, sadece seçilen müşteriye ait olanları göster
      this.filteredOffers = this.offers.filter(
        (offer) => offer.customerId === customerId
      );

      console.log('Filtrelenmiş teklifler:', this.filteredOffers);

      // Auto-fill addresses from customer data
      const customer = this.customers.find((c) => c.id === customerId);
      if (customer && !this.isEditMode) {
        this.orderForm.patchValue({
          customerName: customer.name,
          shippingAddress: customer.address,
          billingAddress: customer.address,
        });
      }
    } else {
      this.filteredOffers = [];
    }
  }

  onOfferChange(): void {
    const offerId = this.orderForm.get('offerId')?.value;
    if (!offerId) return;
    
    console.log(`Teklif değişti, ID: ${offerId}`);
    
    // Önce mevcut tekliflerde arayalım
    const existingOffer = this.offers.find((o) => o.id === +offerId);

    if (existingOffer) {
      console.log('Teklif bulundu:', existingOffer);
      // Eğer teklif zaten yüklenmişse, doğrudan kullan
      this.orderForm.patchValue({
        customerId: existingOffer.customerId,
        customerName: existingOffer.customerName,
      });

      this.populateItemsFromOffer(existingOffer);
      this.calculateTotalAmount();
    } else {
      // Değilse API'den getir
      this.offerService.getOfferById(+offerId).subscribe({
        next: (offer) => {
          if (!offer) {
            console.log('Teklif bulunamadı');
            return;
          }
          
          console.log('Teklif API\'den alındı:', offer);
          this.orderForm.patchValue({
            customerId: offer.customerId,
            customerName: offer.customerName,
          });

          this.populateItemsFromOffer(offer);
          this.calculateTotalAmount();
        },
        error: (err) => {
          console.error('Teklif bilgileri alınırken hata oluştu:', err);
        },
      });
    }
  }

  populateItemsFromOffer(offer: Offer): void {
    console.log('Teklif öğeleri yükleniyor:', offer.items);
    
    // Mevcut öğeleri temizle
    while (this.items.length > 0) {
      this.items.removeAt(0);
    }

    // Teklifteki öğeleri ekle
    if (offer.items && offer.items.length > 0) {
      offer.items.forEach((item) => {
        this.addItem(item);
      });
    } else {
      // Eğer teklif öğeleri yoksa, boş bir öğe ekle
      this.addItem();
    }
    
    // Toplam tutarı güncelle
    this.orderForm.patchValue({
      totalAmount: offer.totalAmount
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.orderForm.valid) {
      console.error('Form geçerli değil:', this.orderForm.errors);
      // Hatalı alanları göster
      Object.keys(this.orderForm.controls).forEach((key) => {
        const control = this.orderForm.get(key);
        if (control?.invalid) {
          console.error(`Hatalı alan: ${key}`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    // Form verilerini al
    const formData = this.orderForm.value;
    
    // Müşteri adını al
    const customer = this.customers.find(c => c.id === +formData.customerId);
    const customerName = customer ? customer.name : formData.customerName;

    // Sipariş verilerini hazırla
    const orderData = {
      ...formData,
      id: this.orderId,
      customerId: +formData.customerId,
      customerName: customerName,
      offerId: formData.offerId ? +formData.offerId : undefined,
      totalAmount: parseFloat(formData.totalAmount),
      orderDate: formData.orderDate ? new Date(formData.orderDate) : new Date(),
      deliveryDate: formData.deliveryDate
        ? new Date(formData.deliveryDate)
        : undefined,
      items: formData.items.map((item: any) => ({
        ...item,
        quantity: +item.quantity,
        unitPrice: +item.unitPrice,
        discount: +item.discount,
        tax: +item.tax,
        total: +item.total,
      })),
    };

    console.log('Sipariş verileri:', orderData);

    if (this.isEditMode && this.orderId) {
      // Mevcut siparişi güncelle
      console.log('Sipariş güncelleniyor:', orderData);
      this.orderService.updateOrder(orderData).subscribe({
        next: (updated) => {
          console.log('Sipariş güncellendi:', updated);
          this.router.navigate(['/orders', this.orderId]);
        },
        error: (err) => {
          console.error('Sipariş güncellenirken hata oluştu:', err);
        },
      });
    } else {
      // Yeni sipariş ekle
      console.log('Yeni sipariş ekleniyor:', orderData);
      this.orderService.addOrder(orderData).subscribe({
        next: (added) => {
          console.log('Sipariş eklendi:', added);
          this.router.navigate(['/orders']);
        },
        error: (err) => {
          console.error('Sipariş eklenirken hata oluştu:', err);
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
