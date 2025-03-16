import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Location, NgClass, DatePipe, CurrencyPipe } from '@angular/common';

import { PaymentService, CustomerService, OrderService } from '../../services';
import { Customer, Order, Payment } from '../../models';
import { PageHeaderComponent, ConfirmDialogComponent } from '../shared';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    NgClass,
    CurrencyPipe,
    PageHeaderComponent,
  ],
  template: `
    <div class="container">
      <app-page-header
        [title]="isEditMode ? 'Ödeme Düzenle' : 'Yeni Ödeme'"
        [subtitle]="
          isEditMode
            ? 'Ödeme bilgilerini güncelleyin'
            : 'Yeni bir ödeme kaydı oluşturun'
        "
      >
        <button class="btn btn-outline-secondary me-2" (click)="goBack()">
          <i class="bi bi-arrow-left me-1"></i> Geri
        </button>
      </app-page-header>

      <div class="card mb-4">
        <div class="card-body">
          <form [formGroup]="paymentForm" (ngSubmit)="onSubmit()">
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
                      {{ customer.companyName }}
                    </option>
                    }
                  </select>
                  @if (submitted && f['customerId'].errors) {
                  <div class="invalid-feedback">Müşteri seçimi zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="orderId" class="form-label">İlgili Sipariş</label>
                  <select
                    class="form-select"
                    id="orderId"
                    formControlName="orderId"
                    (change)="onOrderChange()"
                  >
                    <option value="">Sipariş Seçin</option>
                    @for (order of filteredOrders; track order.id) {
                    <option [value]="order.id">
                      #{{ order.id }} -
                      {{
                        order.totalAmount | currency : '₺' : 'symbol' : '1.2-2'
                      }}
                    </option>
                    }
                  </select>
                </div>

                <div class="mb-3">
                  <label for="amount" class="form-label">Ödeme Tutarı *</label>
                  <div class="input-group">
                    <span class="input-group-text">₺</span>
                    <input
                      type="number"
                      class="form-control"
                      id="amount"
                      formControlName="amount"
                      [ngClass]="{
                        'is-invalid': submitted && f['amount'].errors
                      }"
                      min="0"
                      step="0.01"
                    />
                    @if (submitted && f['amount'].errors) {
                    <div class="invalid-feedback">
                      @if (f['amount'].errors['required']) { Ödeme tutarı
                      zorunludur } @else if (f['amount'].errors['min']) { Ödeme
                      tutarı 0'dan büyük olmalıdır }
                    </div>
                    }
                  </div>
                </div>

                <div class="mb-3">
                  <label for="paymentDate" class="form-label"
                    >Ödeme Tarihi *</label
                  >
                  <input
                    type="date"
                    class="form-control"
                    id="paymentDate"
                    formControlName="paymentDate"
                    [ngClass]="{
                      'is-invalid': submitted && f['paymentDate'].errors
                    }"
                  />
                  @if (submitted && f['paymentDate'].errors) {
                  <div class="invalid-feedback">Ödeme tarihi zorunludur</div>
                  }
                </div>
              </div>

              <div class="col-md-6">
                <h5 class="mb-3">Ödeme Detayları</h5>

                <div class="mb-3">
                  <label for="paymentMethod" class="form-label"
                    >Ödeme Yöntemi *</label
                  >
                  <select
                    class="form-select"
                    id="paymentMethod"
                    formControlName="paymentMethod"
                    [ngClass]="{
                      'is-invalid': submitted && f['paymentMethod'].errors
                    }"
                  >
                    <option value="cash">Nakit</option>
                    <option value="credit_card">Kredi Kartı</option>
                    <option value="bank_transfer">Banka Transferi</option>
                    <option value="check">Çek</option>
                    <option value="other">Diğer</option>
                  </select>
                  @if (submitted && f['paymentMethod'].errors) {
                  <div class="invalid-feedback">Ödeme yöntemi zorunludur</div>
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
                    <option value="completed">Tamamlandı</option>
                    <option value="pending">Beklemede</option>
                    <option value="cancelled">İptal Edildi</option>
                  </select>
                  @if (submitted && f['status'].errors) {
                  <div class="invalid-feedback">Durum zorunludur</div>
                  }
                </div>

                <div class="mb-3">
                  <label for="receiptNumber" class="form-label"
                    >Referans No</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="receiptNumber"
                    formControlName="receiptNumber"
                    placeholder="Dekont no, işlem no vb."
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

            @if (selectedOrder) {
            <div class="row mb-3">
              <div class="col-12">
                <div class="alert alert-info">
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <h6 class="mb-1">Sipariş Bilgileri</h6>
                      <p class="mb-0">
                        Sipariş Tutarı:
                        <strong>{{
                          selectedOrder.totalAmount
                            | currency : '₺' : 'symbol' : '1.2-2'
                        }}</strong>
                      </p>
                      <p class="mb-0">
                        Ödeme Durumu:
                        <strong>{{
                          getPaymentStatusText(selectedOrder.paymentStatus)
                        }}</strong>
                      </p>
                    </div>
                    <div>
                      <a
                        [routerLink]="['/orders', selectedOrder.id]"
                        class="btn btn-sm btn-outline-primary"
                      >
                        <i class="bi bi-eye me-1"></i> Siparişi Görüntüle
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            }

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
export class PaymentFormComponent {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private customerService = inject(CustomerService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  paymentForm!: FormGroup;
  isEditMode = false;
  paymentId?: number;
  submitted = false;
  customers: Customer[] = [];
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;

  constructor() {
    this.initForm();
    this.customers = this.customerService.getCustomers()();
    this.orders = this.orderService.getOrders()();

    this.route.params.subscribe((params) => {
      if (params['id'] && params['id'] !== 'new') {
        this.isEditMode = true;
        this.paymentId = +params['id'];
        this.loadPaymentData();
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams['orderId']) {
        const orderId = +queryParams['orderId'];
        // Önce mevcut siparişlerde arayalım
        const existingOrder = this.orders.find((o) => o.id === orderId);

        if (existingOrder) {
          // Eğer sipariş zaten yüklenmişse, doğrudan kullan
          this.selectedOrder = existingOrder;

          this.paymentForm.patchValue({
            orderId,
            customerId: existingOrder.customerId,
            amount: this.calculateRemainingAmount(existingOrder),
          });

          this.onCustomerChange();
        } else {
          // Değilse API'den getir
          this.orderService.getOrderById(orderId).subscribe({
            next: (order) => {
              if (!order) return;

              this.selectedOrder = order;

              this.paymentForm.patchValue({
                orderId,
                customerId: order.customerId,
                amount: this.calculateRemainingAmount(order),
              });

              this.onCustomerChange();
            },
            error: (err) => {
              console.error('Sipariş bilgileri alınırken hata oluştu:', err);
            },
          });
        }
      }
    });
  }

  get f() {
    return this.paymentForm.controls;
  }

  initForm(): void {
    this.paymentForm = this.fb.group({
      customerId: ['', Validators.required],
      orderId: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      paymentDate: [this.formatDateForInput(new Date()), Validators.required],
      paymentMethod: ['bank_transfer', Validators.required],
      status: ['completed', Validators.required],
      receiptNumber: [''],
      notes: [''],
    });
  }

  loadPaymentData(): void {
    if (this.paymentId) {
      const payment = this.paymentService.getPaymentById(this.paymentId);
      if (payment) {
        // Format date for input type="date"
        const paymentDate = payment.paymentDate
          ? this.formatDateForInput(payment.paymentDate)
          : '';

        // Set form values
        this.paymentForm.patchValue({
          customerId: payment.customerId,
          orderId: payment.orderId || '',
          amount: payment.amount,
          paymentDate: paymentDate,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          receiptNumber: payment.receiptNumber || '',
          notes: payment.notes || '',
        });

        this.onCustomerChange();

        if (payment.orderId) {
          this.onOrderChange();
        }
      } else {
        this.router.navigate(['/payments']);
      }
    }
  }

  onCustomerChange(): void {
    const customerId = +this.paymentForm.get('customerId')?.value;
    if (customerId) {
      this.filteredOrders = this.orders.filter(
        (order) => order.customerId === customerId
      );
    } else {
      this.filteredOrders = [];
    }
  }

  onOrderChange(): void {
    const orderId = this.paymentForm.get('orderId')?.value;
    if (orderId) {
      // Önce mevcut siparişlerde arayalım
      const existingOrder = this.orders.find((o) => o.id === +orderId);

      if (existingOrder) {
        // Eğer sipariş zaten yüklenmişse, doğrudan kullan
        this.selectedOrder = existingOrder;

        this.paymentForm.patchValue({
          customerId: existingOrder.customerId,
          amount: this.calculateRemainingAmount(existingOrder),
        });
      } else {
        // Değilse API'den getir
        this.orderService.getOrderById(+orderId).subscribe({
          next: (order) => {
            if (!order) return;

            this.selectedOrder = order;

            this.paymentForm.patchValue({
              customerId: order.customerId,
              amount: this.calculateRemainingAmount(order),
            });
          },
          error: (err) => {
            console.error('Sipariş bilgileri alınırken hata oluştu:', err);
          },
        });
      }
    } else {
      this.selectedOrder = null;
    }
  }

  calculateRemainingAmount(order: Order): number {
    // Get all completed payments for this order
    const orderPayments = this.paymentService
      .getPayments()()
      .filter((p) => p.orderId === order.id && p.status === 'completed');

    // Calculate total paid amount
    const totalPaid = orderPayments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Calculate remaining amount
    const remaining = order.totalAmount - totalPaid;

    return Math.max(0, parseFloat(remaining.toFixed(2)));
  }

  onSubmit(): void {
    this.submitted = true;

    if (!this.paymentForm.valid) {
      console.error('Form geçerli değil:', this.paymentForm.errors);
      // Hatalı alanları göster
      Object.keys(this.paymentForm.controls).forEach((key) => {
        const control = this.paymentForm.get(key);
        if (control?.invalid) {
          console.error(`Hatalı alan: ${key}`, control.errors);
          control.markAsTouched();
        }
      });
      return;
    }

    // Form verilerini al
    const formValues = this.paymentForm.value;

    // Müşteri adını görüntüleme için al
    const customer = this.customers.find(
      (c) => c.id === +formValues.customerId
    );
    const customerName = customer ? customer.companyName : '';

    // Ödeme verilerini hazırla
    const paymentData = {
      ...formValues,
      id: this.paymentId,
      customerId: +formValues.customerId,
      customerName,
      orderId: formValues.orderId ? +formValues.orderId : undefined,
      amount: +formValues.amount,
      paymentDate: new Date(formValues.paymentDate),
    };

    console.log('Ödeme verileri:', paymentData);

    if (this.isEditMode && this.paymentId) {
      // Mevcut ödemeyi güncelle
      console.log('Ödeme güncelleniyor:', paymentData);
      this.paymentService.updatePayment(paymentData).subscribe({
        next: (updated) => {
          console.log('Ödeme güncellendi:', updated);

          // Ödeme bir siparişe bağlıysa, sipariş ödeme durumunu güncelle
          if (paymentData.orderId) {
            this.updateOrderPaymentStatus(paymentData.orderId);
          }

          this.router.navigate(['/payments']);
        },
        error: (err) => {
          console.error('Ödeme güncellenirken hata oluştu:', err);
        },
      });
    } else {
      // Yeni ödeme ekle
      console.log('Yeni ödeme ekleniyor:', paymentData);
      this.paymentService.addPayment(paymentData).subscribe({
        next: (added) => {
          console.log('Ödeme eklendi:', added);

          // Ödeme bir siparişe bağlıysa, sipariş ödeme durumunu güncelle
          if (paymentData.orderId) {
            this.updateOrderPaymentStatus(paymentData.orderId);
          }

          this.router.navigate(['/payments']);
        },
        error: (err) => {
          console.error('Ödeme eklenirken hata oluştu:', err);
        },
      });
    }
  }

  updateOrderPaymentStatus(orderId: number): void {
    // Önce mevcut siparişlerde var mı kontrol et
    const existingOrder = this.orders.find((o) => o.id === orderId);
    if (existingOrder) {
      const newStatus = this.calculateOrderPaymentStatus(existingOrder);
      const updatedOrder = {
        ...existingOrder,
        paymentStatus: newStatus,
      };

      this.orderService.updateOrder(updatedOrder as Order).subscribe({
        next: () => {
          console.log('Sipariş ödeme durumu güncellendi');
        },
        error: (err) => {
          console.error('Sipariş ödeme durumu güncellenirken hata oluştu', err);
        },
      });
    } else {
      // Değilse API'den getir
      this.orderService.getOrderById(orderId).subscribe({
        next: (order) => {
          if (order) {
            const newStatus = this.calculateOrderPaymentStatus(order);
            const updatedOrder = {
              ...order,
              paymentStatus: newStatus,
            };

            this.orderService.updateOrder(updatedOrder as Order).subscribe({
              next: () => {
                console.log('Sipariş ödeme durumu güncellendi');
              },
              error: (err) => {
                console.error(
                  'Sipariş ödeme durumu güncellenirken hata oluştu',
                  err
                );
              },
            });
          }
        },
        error: (err) => {
          console.error('Sipariş bilgileri alınırken hata oluştu', err);
        },
      });
    }
  }

  calculateOrderPaymentStatus(order: Order): 'pending' | 'partial' | 'paid' {
    const payments = this.paymentService.getPaymentsByOrderId(order.id || 0);
    if (!payments.length) return 'pending';

    const totalPaid = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    if (totalPaid >= order.totalAmount) return 'paid';
    return 'partial';
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'partial':
        return 'Kısmi Ödeme';
      case 'paid':
        return 'Ödendi';
      default:
        return status;
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
