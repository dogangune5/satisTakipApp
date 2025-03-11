import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customers`;

  // Müşteri verilerini tutan signal
  private customers = signal<Customer[]>([]);

  // Tüm müşterileri getir
  getCustomers() {
    this.fetchCustomers().subscribe();
    return this.customers;
  }

  // Müşterileri API'den çek
  fetchCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.apiUrl).pipe(
      tap((customers) => {
        // Tarih alanlarını düzelt
        const formattedCustomers = customers.map((customer) => ({
          ...customer,
          createdAt: new Date(customer.createdAt),
          updatedAt: customer.updatedAt
            ? new Date(customer.updatedAt)
            : undefined,
        }));
        this.customers.set(formattedCustomers);
      }),
      catchError((error) => {
        console.error('Müşteriler getirilirken hata oluştu', error);
        // Hata durumunda boş dizi döndür
        this.customers.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre müşteri getir
  getCustomerById(id: number): Observable<Customer | undefined> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`).pipe(
      map((customer) => ({
        ...customer,
        createdAt: new Date(customer.createdAt),
        updatedAt: customer.updatedAt
          ? new Date(customer.updatedAt)
          : undefined,
      })),
      catchError((error) => {
        console.error(`Müşteri ID:${id} getirilirken hata oluştu`, error);
        return of(undefined);
      })
    );
  }

  // Yeni müşteri ekle
  addCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer).pipe(
      map((newCustomer) => ({
        ...newCustomer,
        createdAt: new Date(newCustomer.createdAt),
        updatedAt: newCustomer.updatedAt
          ? new Date(newCustomer.updatedAt)
          : undefined,
      })),
      tap((newCustomer) => {
        this.customers.update((customers) => [...customers, newCustomer]);
      }),
      catchError((error) => {
        console.error('Müşteri eklenirken hata oluştu', error);
        return throwError(() => new Error('Müşteri eklenirken hata oluştu'));
      })
    );
  }

  // Müşteri güncelle
  updateCustomer(updatedCustomer: Customer): Observable<Customer> {
    return this.http
      .patch<Customer>(`${this.apiUrl}/${updatedCustomer.id}`, updatedCustomer)
      .pipe(
        map((customer) => ({
          ...customer,
          createdAt: new Date(customer.createdAt),
          updatedAt: customer.updatedAt
            ? new Date(customer.updatedAt)
            : undefined,
        })),
        tap((customer) => {
          this.customers.update((customers) =>
            customers.map((c) => (c.id === customer.id ? customer : c))
          );
        }),
        catchError((error) => {
          console.error('Müşteri güncellenirken hata oluştu', error);
          return throwError(
            () => new Error('Müşteri güncellenirken hata oluştu')
          );
        })
      );
  }

  // Müşteri sil
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.customers.update((customers) =>
          customers.filter((customer) => customer.id !== id)
        );
      }),
      catchError((error) => {
        console.error('Müşteri silinirken hata oluştu', error);
        return throwError(() => new Error('Müşteri silinirken hata oluştu'));
      })
    );
  }
}
