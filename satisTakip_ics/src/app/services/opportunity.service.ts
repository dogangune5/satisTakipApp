import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Opportunity } from '../models';
import { environment } from '../../environments/environment';
import { catchError, map, tap, switchMap, finalize } from 'rxjs/operators';
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
    console.log("Fırsatlar API'den getiriliyor...");
    return this.http.get<Opportunity[]>(this.apiUrl).pipe(
      tap((opportunities) => {
        // Tarih alanlarını düzelt
        const formattedOpportunities = opportunities.map((opportunity) => ({
          ...opportunity,
          expectedCloseDate: opportunity.expectedCloseDate
            ? new Date(opportunity.expectedCloseDate)
            : new Date(),
          createdAt: opportunity.createdAt
            ? new Date(opportunity.createdAt)
            : new Date(),
          updatedAt: opportunity.updatedAt
            ? new Date(opportunity.updatedAt)
            : undefined,
        }));
        this.opportunities.set(formattedOpportunities);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Fırsatlar getirilirken hata oluştu', error);
        // Hata durumunda boş dizi döndür
        this.opportunities.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre fırsat getir
  getOpportunityById(id: number): Observable<Opportunity | undefined> {
    console.log(`Fırsat API'den getiriliyor, ID: ${id}`);
    return this.http.get<Opportunity>(`${this.apiUrl}/${id}`).pipe(
      map((opportunity) => ({
        ...opportunity,
        expectedCloseDate: opportunity.expectedCloseDate
          ? new Date(opportunity.expectedCloseDate)
          : new Date(),
        createdAt: opportunity.createdAt
          ? new Date(opportunity.createdAt)
          : new Date(),
        updatedAt: opportunity.updatedAt
          ? new Date(opportunity.updatedAt)
          : undefined,
      })),
      catchError((error: HttpErrorResponse) => {
        console.error(`Fırsat ID:${id} getirilirken hata oluştu`, error);
        return of(undefined);
      })
    );
  }

  // Müşteri ID'sine göre fırsatları getir
  getOpportunitiesByCustomerId(customerId: number): Observable<Opportunity[]> {
    console.log(
      `Müşteriye ait fırsatlar API'den getiriliyor, Müşteri ID: ${customerId}`
    );
    return this.http
      .get<Opportunity[]>(`${this.apiUrl}?customerId=${customerId}`)
      .pipe(
        map((opportunities) =>
          opportunities.map((opportunity) => ({
            ...opportunity,
            expectedCloseDate: opportunity.expectedCloseDate
              ? new Date(opportunity.expectedCloseDate)
              : new Date(),
            createdAt: opportunity.createdAt
              ? new Date(opportunity.createdAt)
              : new Date(),
            updatedAt: opportunity.updatedAt
              ? new Date(opportunity.updatedAt)
              : undefined,
          }))
        ),
        catchError((error: HttpErrorResponse) => {
          console.error(
            `Müşteri ID:${customerId} için fırsatlar getirilirken hata oluştu`,
            error
          );
          return of([]);
        })
      );
  }

  // Yeni fırsat ekle
  addOpportunity(opportunity: any): Observable<Opportunity> {
    console.log("Yeni fırsat API'ye ekleniyor:", opportunity);

    // Backend'in istemediği alanları çıkar
    const { id, createdAt, updatedAt, ...opportunityWithoutServerFields } =
      opportunity;

    // Tarih alanlarını düzelt
    const preparedOpportunity = {
      ...opportunityWithoutServerFields,
      expectedCloseDate:
        opportunity.expectedCloseDate instanceof Date
          ? opportunity.expectedCloseDate.toISOString()
          : opportunity.expectedCloseDate,
    };

    return this.http.post<Opportunity>(this.apiUrl, preparedOpportunity).pipe(
      map((newOpportunity) => ({
        ...newOpportunity,
        expectedCloseDate: newOpportunity.expectedCloseDate
          ? new Date(newOpportunity.expectedCloseDate)
          : new Date(),
        createdAt: newOpportunity.createdAt
          ? new Date(newOpportunity.createdAt)
          : new Date(),
        updatedAt: newOpportunity.updatedAt
          ? new Date(newOpportunity.updatedAt)
          : undefined,
      })),
      tap((newOpportunity) => {
        this.opportunities.update((opportunities) => [
          ...opportunities,
          newOpportunity,
        ]);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Fırsat eklenirken hata oluştu', error);
        return throwError(
          () =>
            new Error(
              `Fırsat eklenirken hata oluştu: ${
                error.error?.message || error.message
              }`
            )
        );
      })
    );
  }

  // Fırsat güncelle
  updateOpportunity(updatedOpportunity: any): Observable<Opportunity> {
    console.log(
      `Fırsat API'de güncelleniyor, ID: ${updatedOpportunity.id}`,
      updatedOpportunity
    );

    // ID'yi ayrı tut ve backend'in istemediği alanları çıkar
    const { id, createdAt, updatedAt, ...opportunityWithoutServerFields } =
      updatedOpportunity;

    const preparedOpportunity = {
      ...opportunityWithoutServerFields,
      expectedCloseDate:
        updatedOpportunity.expectedCloseDate instanceof Date
          ? updatedOpportunity.expectedCloseDate.toISOString()
          : updatedOpportunity.expectedCloseDate,
    };

    return this.http
      .patch<Opportunity>(`${this.apiUrl}/${id}`, preparedOpportunity)
      .pipe(
        map((opportunity) => ({
          ...opportunity,
          expectedCloseDate: opportunity.expectedCloseDate
            ? new Date(opportunity.expectedCloseDate)
            : new Date(),
          createdAt: opportunity.createdAt
            ? new Date(opportunity.createdAt)
            : new Date(),
          updatedAt: opportunity.updatedAt
            ? new Date(opportunity.updatedAt)
            : undefined,
        })),
        tap((opportunity) => {
          this.opportunities.update((opportunities) =>
            opportunities.map((o) =>
              o.id === opportunity.id ? opportunity : o
            )
          );
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Fırsat güncellenirken hata oluştu', error);

          // Hata mesajını daha detaylı hale getir
          let errorMessage = 'Fırsat güncellenirken hata oluştu';
          if (error.error?.message) {
            errorMessage += `: ${error.error.message}`;
          } else if (error.message) {
            errorMessage += `: ${error.message}`;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Fırsat sil
  deleteOpportunity(id: number): Observable<void> {
    console.log(`Fırsat API'den siliniyor, ID: ${id}`);

    // Doğrudan silme işlemini gerçekleştir
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        console.log(`Fırsat başarıyla silindi, ID: ${id}`);
        // Yerel veriyi güncelle
        this.opportunities.update((opportunities) =>
          opportunities.filter((opportunity) => opportunity.id !== id)
        );
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Fırsat silinirken hata oluştu', error);

        // İlişkisel veritabanı hatası kontrolü
        if (
          error.status === 500 &&
          error.error?.message?.includes('foreign key constraint')
        ) {
          return throwError(
            () =>
              new Error(
                'Bu fırsat silinemez çünkü bağlı teklifler bulunuyor. Önce bu fırsata ait teklifleri silmeniz gerekiyor.'
              )
          );
        }

        return throwError(
          () =>
            new Error(
              `Fırsat silinirken hata oluştu: ${
                error.error?.message || error.message
              }`
            )
        );
      }),
      // İşlem tamamlandığında veya hata olduğunda çalışacak
      finalize(() => {
        console.log('Fırsat silme işlemi tamamlandı (başarılı veya başarısız)');
      })
    );
  }

  // Fırsata bağlı teklifleri kontrol et - artık kullanılmıyor
  private checkRelatedOffers(opportunityId: number): Observable<boolean> {
    return this.http
      .get<any[]>(`${environment.apiUrl}/offers?opportunityId=${opportunityId}`)
      .pipe(
        map((offers) => offers.length > 0),
        catchError(() => {
          // API hatası durumunda, güvenli tarafta kalmak için false döndür
          console.warn(
            'Fırsata bağlı teklifler kontrol edilemedi, güvenli mod aktif'
          );
          return of(false);
        })
      );
  }
}
