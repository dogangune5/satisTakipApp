import { Injectable, signal } from '@angular/core';
import { Order } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private orders = signal<Order[]>([
    {
      id: 1,
      orderNumber: 'SIP-2023-001',
      customerId: 1,
      customerName: 'Yılmaz Teknoloji A.Ş.',
      items: [
        {
          id: 1,
          productName: 'ERP Temel Modül',
          quantity: 1,
          unitPrice: 100000,
          discount: 10,
          tax: 18,
          total: 90000,
          description: 'Temel ERP modülü lisansı',
        },
        {
          id: 2,
          productName: 'Finans Modülü',
          quantity: 1,
          unitPrice: 50000,
          discount: 5,
          tax: 18,
          total: 47500,
          description: 'Finans yönetim modülü',
        },
      ],
      totalAmount: 137500,
      status: 'processing',
      orderDate: new Date('2023-06-01'),
      deliveryDate: new Date('2023-07-15'),
      createdAt: new Date('2023-06-01'),
      notes: 'Müşteri acil teslimat istiyor',
      shippingAddress: 'Atatürk Cad. No:123, İstanbul',
      billingAddress: 'Atatürk Cad. No:123, İstanbul',
      paymentStatus: 'partial',
      offerId: 1,
    },
    {
      id: 2,
      orderNumber: 'SIP-2023-002',
      customerId: 2,
      customerName: 'Demir İnşaat Ltd. Şti.',
      items: [
        {
          id: 1,
          productName: 'Mobil Uygulama Geliştirme',
          quantity: 1,
          unitPrice: 80000,
          tax: 18,
          total: 80000,
          description: 'Android ve iOS platformları için uygulama geliştirme',
        },
      ],
      totalAmount: 80000,
      status: 'new',
      orderDate: new Date('2023-06-10'),
      createdAt: new Date('2023-06-10'),
      shippingAddress: 'Cumhuriyet Mah. 456 Sok. No:7, Ankara',
      billingAddress: 'Cumhuriyet Mah. 456 Sok. No:7, Ankara',
      paymentStatus: 'pending',
      offerId: 2,
    },
  ]);

  getOrders() {
    return this.orders;
  }

  getOrderById(id: number) {
    return this.orders().find((order) => order.id === id);
  }

  getOrdersByCustomerId(customerId: number) {
    return this.orders().filter((order) => order.customerId === customerId);
  }

  addOrder(order: Order) {
    const newOrder = {
      ...order,
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      createdAt: new Date(),
    };

    this.orders.update((orders) => [...orders, newOrder]);
    return newOrder;
  }

  updateOrder(updatedOrder: Order) {
    this.orders.update((orders) =>
      orders.map((order) =>
        order.id === updatedOrder.id
          ? { ...updatedOrder, updatedAt: new Date() }
          : order
      )
    );
  }

  deleteOrder(id: number) {
    this.orders.update((orders) => orders.filter((order) => order.id !== id));
  }

  private generateId(): number {
    const orders = this.orders();
    return orders.length > 0
      ? Math.max(...orders.map((order) => order.id || 0)) + 1
      : 1;
  }

  private generateOrderNumber(): string {
    const orders = this.orders();
    const year = new Date().getFullYear();
    const lastOrderNumber =
      orders
        .filter((order) => order.orderNumber.includes(`SIP-${year}`))
        .map((order) => parseInt(order.orderNumber.split('-')[2]))
        .sort((a, b) => b - a)[0] || 0;

    return `SIP-${year}-${(lastOrderNumber + 1).toString().padStart(3, '0')}`;
  }
}
