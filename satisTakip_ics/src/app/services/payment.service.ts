import { Injectable, signal } from '@angular/core';
import { Payment } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private payments = signal<Payment[]>([
    {
      id: 1,
      paymentNumber: 'ODM-2023-001',
      orderId: 1,
      orderNumber: 'SIP-2023-001',
      customerId: 1,
      customerName: 'Yılmaz Teknoloji A.Ş.',
      amount: 50000,
      paymentDate: new Date('2023-06-05'),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      notes: 'İlk ödeme taksiti',
      createdAt: new Date('2023-06-05'),
      receiptNumber: 'RCPT-2023-001',
      bankDetails: 'Garanti Bankası TR12 3456 7890 1234 5678 90',
      transactionId: 'TRX123456789',
    },
    {
      id: 2,
      paymentNumber: 'ODM-2023-002',
      orderId: 1,
      orderNumber: 'SIP-2023-001',
      customerId: 1,
      customerName: 'Yılmaz Teknoloji A.Ş.',
      amount: 40000,
      paymentDate: new Date('2023-06-20'),
      paymentMethod: 'bank_transfer',
      status: 'completed',
      notes: 'İkinci ödeme taksiti',
      createdAt: new Date('2023-06-20'),
      receiptNumber: 'RCPT-2023-002',
      bankDetails: 'Garanti Bankası TR12 3456 7890 1234 5678 90',
      transactionId: 'TRX987654321',
    },
  ]);

  getPayments() {
    return this.payments;
  }

  getPaymentById(id: number) {
    return this.payments().find((payment) => payment.id === id);
  }

  getPaymentsByOrderId(orderId: number) {
    return this.payments().filter((payment) => payment.orderId === orderId);
  }

  getPaymentsByCustomerId(customerId: number) {
    return this.payments().filter(
      (payment) => payment.customerId === customerId
    );
  }

  addPayment(payment: Payment) {
    const newPayment = {
      ...payment,
      id: this.generateId(),
      paymentNumber: this.generatePaymentNumber(),
      createdAt: new Date(),
    };

    this.payments.update((payments) => [...payments, newPayment]);
    return newPayment;
  }

  updatePayment(updatedPayment: Payment) {
    this.payments.update((payments) =>
      payments.map((payment) =>
        payment.id === updatedPayment.id
          ? { ...updatedPayment, updatedAt: new Date() }
          : payment
      )
    );
  }

  deletePayment(id: number) {
    this.payments.update((payments) =>
      payments.filter((payment) => payment.id !== id)
    );
  }

  private generateId(): number {
    const payments = this.payments();
    return payments.length > 0
      ? Math.max(...payments.map((payment) => payment.id || 0)) + 1
      : 1;
  }

  private generatePaymentNumber(): string {
    const payments = this.payments();
    const year = new Date().getFullYear();
    const lastPaymentNumber =
      payments
        .filter((payment) => payment.paymentNumber.includes(`ODM-${year}`))
        .map((payment) => parseInt(payment.paymentNumber.split('-')[2]))
        .sort((a, b) => b - a)[0] || 0;

    return `ODM-${year}-${(lastPaymentNumber + 1).toString().padStart(3, '0')}`;
  }
}
