import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Opportunity } from '../models';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OpportunityService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/opportunities`;

  // Fırsat verilerini tutan signal
  private opportunities = signal<Opportunity[]>([]);

  // Tüm fırsatları getir
  getOpportunities() {
    this.fetchOpportunities().subscribe();
    return this.opportunities;
  }

  // Fırsatları API'den çek
  fetchOpportunities(): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(this.apiUrl).pipe(
      tap((opportunities) => {
        // Tarih alanlarını düzelt
        const formattedOpportunities = opportunities.map((opportunity) => ({
          ...opportunity,
          expectedCloseDate: new Date(opportunity.expectedCloseDate),
          createdAt: new Date(opportunity.createdAt),
          updatedAt: opportunity.updatedAt
            ? new Date(opportunity.updatedAt)
            : undefined,
        }));
        this.opportunities.set(formattedOpportunities);
      }),
      catchError((error) => {
        console.error('Fırsatlar getirilirken hata oluştu', error);
        // Hata durumunda boş dizi döndür
        this.opportunities.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre fırsat getir
  getOpportunityById(id: number): Observable<Opportunity | undefined> {
    console.log(`API çağrısı: GET ${this.apiUrl}/${id}`);
    return this.http.get<Opportunity>(`${this.apiUrl}/${id}`).pipe(
      tap(response => console.log('API yanıtı:', response)),
      map((opportunity) => ({
        ...opportunity,
        expectedCloseDate: new Date(opportunity.expectedCloseDate),
        createdAt: new Date(opportunity.createdAt),
        updatedAt: opportunity.updatedAt
          ? new Date(opportunity.updatedAt)
          : undefined,
      })),
      catchError((error) => {
        console.error(`Fırsat ID:${id} getirilirken hata oluştu`, error);
        return of(undefined);
      })
    );
  }

  // Müşteri ID'sine göre fırsatları getir
  getOpportunitiesByCustomerId(customerId: number): Observable<Opportunity[]> {
    return this.http.get<Opportunity[]>(`${this.apiUrl}?customerId=${customerId}`).pipe(
      map((opportunities) => opportunities.map(opportunity => ({
        ...opportunity,
        expectedCloseDate: new Date(opportunity.expectedCloseDate),
        createdAt: new Date(opportunity.createdAt),
        updatedAt: opportunity.updatedAt
          ? new Date(opportunity.updatedAt)
          : undefined,
      }))),
      catchError((error) => {
        console.error(`Müşteri ID:${customerId} için fırsatlar getirilirken hata oluştu`, error);
        return of([]);
      })
    );
  }

  // Yeni fırsat ekle
  addOpportunity(opportunity: Opportunity): Observable<Opportunity> {
    return this.http.post<Opportunity>(this.apiUrl, opportunity).pipe(
      map((newOpportunity) => ({
        ...newOpportunity,
        expectedCloseDate: new Date(newOpportunity.expectedCloseDate),
        createdAt: new Date(newOpportunity.createdAt),
        updatedAt: newOpportunity.updatedAt
          ? new Date(newOpportunity.updatedAt)
          : undefined,
      })),
      tap((newOpportunity) => {
        this.opportunities.update((opportunities) => [...opportunities, newOpportunity]);
      }),
      catchError((error) => {
        console.error('Fırsat eklenirken hata oluştu', error);
        return throwError(() => new Error('Fırsat eklenirken hata oluştu'));
      })
    );
  }

  // Fırsat güncelle
  updateOpportunity(updatedOpportunity: Opportunity): Observable<Opportunity> {
    return this.http
      .patch<Opportunity>(`${this.apiUrl}/${updatedOpportunity.id}`, updatedOpportunity)
      .pipe(
        map((opportunity) => ({
          ...opportunity,
          expectedCloseDate: new Date(opportunity.expectedCloseDate),
          createdAt: new Date(opportunity.createdAt),
          updatedAt: opportunity.updatedAt
            ? new Date(opportunity.updatedAt)
            : undefined,
        })),
        tap((opportunity) => {
          this.opportunities.update((opportunities) =>
            opportunities.map((o) => (o.id === opportunity.id ? opportunity : o))
          );
        }),
        catchError((error) => {
          console.error('Fırsat güncellenirken hata oluştu', error);
          return throwError(
            () => new Error('Fırsat güncellenirken hata oluştu')
          );
        })
      );
  }

  // Fırsat sil
  deleteOpportunity(id: number): Observable<void> {
    console.log(`API çağrısı: DELETE ${this.apiUrl}/${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`Fırsat silindi, ID: ${id}`);
        // Fırsat listesini güncelle
        this.opportunities.update((opportunities) =>
          opportunities.filter((opportunity) => opportunity.id !== id)
        );
      }),
      catchError((error) => {
        console.error('Fırsat silinirken hata oluştu', error);
        return throwError(() => new Error('Fırsat silinirken hata oluştu'));
      })
    );
  }
}
