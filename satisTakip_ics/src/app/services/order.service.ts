import { HttpClient } from '@angular/common/http';
import { Injectable, signal, inject } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  // Sipariş verilerini tutan signal
  private orders = signal<Order[]>([]);

  constructor() {}

  // Tüm siparişleri getir
  getOrders() {
    this.fetchOrders().subscribe();
    return this.orders;
  }

  // Siparişleri API'den çek
  fetchOrders(): Observable<Order[]> {
    console.log("Siparişler API'den getiriliyor...");
    return this.http.get<Order[]>(this.apiUrl).pipe(
      tap((orders) => {
        // Tarih alanlarını düzelt
        const formattedOrders = orders.map((order) => ({
          ...order,
          orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
          deliveryDate: order.deliveryDate
            ? new Date(order.deliveryDate)
            : undefined,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
        }));
        this.orders.set(formattedOrders);
      }),
      catchError((error) => {
        console.error('Siparişler getirilirken hata oluştu', error);

        // API endpoint bulunamadı hatası için özel mesaj
        if (error.status === 404) {
          console.warn(
            "API endpoint bulunamadı: /orders. Backend API endpoint'i oluşturulmalı."
          );
        }

        // Hata durumunda boş dizi döndür
        this.orders.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre sipariş getir
  getOrderById(id: number): Observable<Order | undefined> {
    console.log(`Sipariş API'den getiriliyor, ID: ${id}`);
    return this.http.get<Order>(`${this.apiUrl}/${id}`).pipe(
      map((order) => ({
        ...order,
        orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
        deliveryDate: order.deliveryDate
          ? new Date(order.deliveryDate)
          : undefined,
        createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
      })),
      catchError((error) => {
        console.error(`Sipariş ID:${id} getirilirken hata oluştu`, error);

        // API endpoint bulunamadı hatası için özel mesaj
        if (error.status === 404) {
          console.warn(
            `API endpoint bulunamadı: /orders/${id}. Backend API endpoint'i oluşturulmalı.`
          );
        }

        return of(undefined);
      })
    );
  }

  // Müşteri ID'sine göre siparişleri getir
  getOrdersByCustomerId(customerId: number): Observable<Order[]> {
    console.log(
      `Müşteriye ait siparişler API'den getiriliyor, Müşteri ID: ${customerId}`
    );
    return this.http
      .get<Order[]>(`${this.apiUrl}?customerId=${customerId}`)
      .pipe(
        map((orders) =>
          orders.map((order) => ({
            ...order,
            orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
            deliveryDate: order.deliveryDate
              ? new Date(order.deliveryDate)
              : undefined,
            createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
            updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
          }))
        ),
        catchError((error) => {
          console.error(
            `Müşteri ID:${customerId} için siparişler getirilirken hata oluştu`,
            error
          );

          // API endpoint bulunamadı hatası için özel mesaj
          if (error.status === 404) {
            console.warn(
              `API endpoint bulunamadı: /orders?customerId=${customerId}. Backend API endpoint'i oluşturulmalı.`
            );
          }

          return of([]);
        })
      );
  }

  // Teklif ID'sine göre siparişleri getir
  getOrdersByOfferId(offerId: number): Observable<Order[]> {
    console.log(
      `Teklife ait siparişler API'den getiriliyor, Teklif ID: ${offerId}`
    );
    return this.http.get<Order[]>(`${this.apiUrl}?offerId=${offerId}`).pipe(
      map((orders) =>
        orders.map((order) => ({
          ...order,
          orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
          deliveryDate: order.deliveryDate
            ? new Date(order.deliveryDate)
            : undefined,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
        }))
      ),
      catchError((error) => {
        console.error(
          `Teklif ID:${offerId} için siparişler getirilirken hata oluştu`,
          error
        );

        // API endpoint bulunamadı hatası için özel mesaj
        if (error.status === 404) {
          console.warn(
            `API endpoint bulunamadı: /orders?offerId=${offerId}. Backend API endpoint'i oluşturulmalı.`
          );
        }

        return of([]);
      })
    );
  }

  // Yeni sipariş ekle
  addOrder(order: Order): Observable<Order> {
    console.log("Yeni sipariş API'ye ekleniyor:", order);
    return this.http.post<Order>(this.apiUrl, order).pipe(
      map((newOrder) => ({
        ...newOrder,
        orderDate: newOrder.orderDate
          ? new Date(newOrder.orderDate)
          : new Date(),
        deliveryDate: newOrder.deliveryDate
          ? new Date(newOrder.deliveryDate)
          : undefined,
        createdAt: newOrder.createdAt
          ? new Date(newOrder.createdAt)
          : new Date(),
        updatedAt: newOrder.updatedAt
          ? new Date(newOrder.updatedAt)
          : undefined,
      })),
      tap((newOrder) => {
        this.orders.update((orders) => [...orders, newOrder]);
      }),
      catchError((error) => {
        console.error('Sipariş eklenirken hata oluştu', error);

        // API endpoint bulunamadı hatası için özel mesaj
        if (error.status === 404) {
          console.warn(
            `API endpoint bulunamadı: /orders (POST). Backend API endpoint'i oluşturulmalı.`
          );
        }

        return throwError(
          () =>
            new Error(
              'Sipariş eklenirken hata oluştu: ' +
                (error.error?.message || error.message)
            )
        );
      })
    );
  }

  // Sipariş güncelle
  updateOrder(updatedOrder: Order): Observable<Order> {
    console.log(
      `Sipariş API'de güncelleniyor, ID: ${updatedOrder.id}`,
      updatedOrder
    );
    return this.http
      .patch<Order>(`${this.apiUrl}/${updatedOrder.id}`, updatedOrder)
      .pipe(
        map((order) => ({
          ...order,
          orderDate: order.orderDate ? new Date(order.orderDate) : new Date(),
          deliveryDate: order.deliveryDate
            ? new Date(order.deliveryDate)
            : undefined,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt) : undefined,
        })),
        tap((order) => {
          this.orders.update((orders) =>
            orders.map((o) => (o.id === order.id ? order : o))
          );
        }),
        catchError((error) => {
          console.error('Sipariş güncellenirken hata oluştu', error);

          // API endpoint bulunamadı hatası için özel mesaj
          if (error.status === 404) {
            console.warn(
              `API endpoint bulunamadı: /orders/${updatedOrder.id} (PATCH). Backend API endpoint'i oluşturulmalı.`
            );
          }

          return throwError(
            () =>
              new Error(
                'Sipariş güncellenirken hata oluştu: ' +
                  (error.error?.message || error.message)
              )
          );
        })
      );
  }

  // Sipariş sil
  deleteOrder(id: number): Observable<void> {
    console.log(`Sipariş API'den siliniyor, ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.orders.update((orders) =>
          orders.filter((order) => order.id !== id)
        );
      }),
      catchError((error) => {
        console.error('Sipariş silinirken hata oluştu', error);

        // API endpoint bulunamadı hatası için özel mesaj
        if (error.status === 404) {
          console.warn(
            `API endpoint bulunamadı: /orders/${id} (DELETE). Backend API endpoint'i oluşturulmalı.`
          );
        }

        return throwError(
          () =>
            new Error(
              'Sipariş silinirken hata oluştu: ' +
                (error.error?.message || error.message)
            )
        );
      })
    );
  }
}
