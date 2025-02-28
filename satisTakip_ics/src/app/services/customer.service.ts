import { Injectable, signal } from '@angular/core';
import { Customer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private customers = signal<Customer[]>([
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      companyName: 'Yılmaz Teknoloji A.Ş.',
      email: 'ahmet@yilmaztech.com',
      phone: '0532 123 4567',
      address: 'Atatürk Cad. No:123',
      city: 'İstanbul',
      country: 'Türkiye',
      notes: 'Yazılım çözümleri için potansiyel müşteri',
      createdAt: new Date('2023-01-15'),
      status: 'active',
      contactPerson: 'Mehmet Yılmaz',
      contactPersonTitle: 'Satın Alma Müdürü',
      contactPersonPhone: '0533 765 4321',
      taxId: '1234567890',
      sector: 'Teknoloji',
    },
    {
      id: 2,
      name: 'Ayşe Demir',
      companyName: 'Demir İnşaat Ltd. Şti.',
      email: 'ayse@demirinsaat.com',
      phone: '0542 987 6543',
      address: 'Cumhuriyet Mah. 456 Sok. No:7',
      city: 'Ankara',
      country: 'Türkiye',
      createdAt: new Date('2023-02-20'),
      status: 'active',
      sector: 'İnşaat',
    },
    {
      id: 3,
      name: 'Mehmet Kaya',
      companyName: 'Kaya Otomotiv',
      email: 'mehmet@kayaoto.com',
      phone: '0555 333 2211',
      address: 'Sanayi Sitesi B Blok No:42',
      city: 'İzmir',
      country: 'Türkiye',
      createdAt: new Date('2023-03-10'),
      status: 'lead',
      notes: 'Filo yönetim sistemi ile ilgileniyor',
    },
  ]);

  getCustomers() {
    return this.customers;
  }

  getCustomerById(id: number) {
    return this.customers().find((customer) => customer.id === id);
  }

  addCustomer(customer: Customer) {
    const newCustomer = {
      ...customer,
      id: this.generateId(),
      createdAt: new Date(),
    };

    this.customers.update((customers) => [...customers, newCustomer]);
    return newCustomer;
  }

  updateCustomer(updatedCustomer: Customer) {
    this.customers.update((customers) =>
      customers.map((customer) =>
        customer.id === updatedCustomer.id
          ? { ...updatedCustomer, updatedAt: new Date() }
          : customer
      )
    );
  }

  deleteCustomer(id: number) {
    this.customers.update((customers) =>
      customers.filter((customer) => customer.id !== id)
    );
  }

  private generateId(): number {
    const customers = this.customers();
    return customers.length > 0
      ? Math.max(...customers.map((customer) => customer.id || 0)) + 1
      : 1;
  }
}
