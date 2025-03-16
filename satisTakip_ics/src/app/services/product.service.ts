import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  // Ürün verilerini tutan signal
  private products = signal<Product[]>([]);

  // Tüm ürünleri getir
  getProducts() {
    this.fetchProducts().subscribe();
    return this.products;
  }

  // Ürünleri API'den çek
  fetchProducts(): Observable<Product[]> {
    console.log("Ürünler API'den getiriliyor...");
    return this.http.get<Product[]>(this.apiUrl).pipe(
      tap((products) => {
        // Tarih alanlarını düzelt
        const formattedProducts = products.map((product) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt
            ? new Date(product.updatedAt)
            : undefined,
        }));
        this.products.set(formattedProducts);
      }),
      catchError((error) => {
        console.error('Ürünler getirilirken hata oluştu', error);
        // Hata durumunda boş dizi döndür
        this.products.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre ürün getir
  getProductById(id: number): Observable<Product | undefined> {
    console.log(`Ürün API'den getiriliyor, ID: ${id}`);
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      map((product) => ({
        ...product,
        createdAt: new Date(product.createdAt),
        updatedAt: product.updatedAt ? new Date(product.updatedAt) : undefined,
      })),
      catchError((error) => {
        console.error(`Ürün ID:${id} getirilirken hata oluştu`, error);
        return of(undefined);
      })
    );
  }

  // Yeni ürün ekle
  addProduct(product: Product): Observable<Product> {
    console.log("Yeni ürün API'ye ekleniyor:", product);
    return this.http.post<Product>(this.apiUrl, product).pipe(
      map((newProduct) => ({
        ...newProduct,
        createdAt: new Date(newProduct.createdAt),
        updatedAt: newProduct.updatedAt
          ? new Date(newProduct.updatedAt)
          : undefined,
      })),
      tap((newProduct) => {
        this.products.update((products) => [...products, newProduct]);
      }),
      catchError((error) => {
        console.error('Ürün eklenirken hata oluştu', error);
        return throwError(() => new Error('Ürün eklenirken hata oluştu'));
      })
    );
  }

  // Ürün güncelle
  updateProduct(updatedProduct: Product): Observable<Product> {
    console.log(
      `Ürün API'de güncelleniyor, ID: ${updatedProduct.id}`,
      updatedProduct
    );
    return this.http
      .patch<Product>(`${this.apiUrl}/${updatedProduct.id}`, updatedProduct)
      .pipe(
        map((product) => ({
          ...product,
          createdAt: new Date(product.createdAt),
          updatedAt: product.updatedAt
            ? new Date(product.updatedAt)
            : undefined,
        })),
        tap((product) => {
          this.products.update((products) =>
            products.map((p) => (p.id === product.id ? product : p))
          );
        }),
        catchError((error) => {
          console.error('Ürün güncellenirken hata oluştu', error);
          return throwError(() => new Error('Ürün güncellenirken hata oluştu'));
        })
      );
  }

  // Ürün sil
  deleteProduct(id: number): Observable<void> {
    console.log(`Ürün API'den siliniyor, ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.products.update((products) =>
          products.filter((product) => product.id !== id)
        );
      }),
      catchError((error) => {
        console.error('Ürün silinirken hata oluştu', error);
        return throwError(() => new Error('Ürün silinirken hata oluştu'));
      })
    );
  }
}
