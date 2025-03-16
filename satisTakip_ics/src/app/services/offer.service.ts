import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Offer } from '../models';
import { environment } from '../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/offers`;

  // Teklif verilerini tutan signal
  private offers = signal<Offer[]>([]);

  // Tüm teklifleri getir
  getOffers() {
    this.fetchOffers().subscribe();
    return this.offers;
  }

  // Teklifleri API'den çek
  fetchOffers(): Observable<Offer[]> {
    console.log('Teklifler API\'den getiriliyor...');
    return this.http.get<Offer[]>(this.apiUrl).pipe(
      tap((offers) => {
        // Tarih alanlarını düzelt
        const formattedOffers = offers.map((offer) => ({
          ...offer,
          validUntil: new Date(offer.validUntil),
          createdAt: new Date(offer.createdAt),
          updatedAt: offer.updatedAt ? new Date(offer.updatedAt) : undefined,
        }));
        this.offers.set(formattedOffers);
      }),
      catchError((error) => {
        console.error('Teklifler getirilirken hata oluştu', error);
        // Hata durumunda boş dizi döndür
        this.offers.set([]);
        return of([]);
      })
    );
  }

  // ID'ye göre teklif getir
  getOfferById(id: number): Observable<Offer | undefined> {
    console.log(`Teklif API'den getiriliyor, ID: ${id}`);
    return this.http.get<Offer>(`${this.apiUrl}/${id}`).pipe(
      map((offer) => ({
        ...offer,
        validUntil: new Date(offer.validUntil),
        createdAt: new Date(offer.createdAt),
        updatedAt: offer.updatedAt ? new Date(offer.updatedAt) : undefined,
      })),
      catchError((error) => {
        console.error(`Teklif ID:${id} getirilirken hata oluştu`, error);
        return of(undefined);
      })
    );
  }

  // Müşteri ID'sine göre teklifleri getir
  getOffersByCustomerId(customerId: number): Observable<Offer[]> {
    console.log(`Müşteriye ait teklifler API'den getiriliyor, Müşteri ID: ${customerId}`);
    return this.http.get<Offer[]>(`${this.apiUrl}?customerId=${customerId}`).pipe(
      map((offers) => offers.map(offer => ({
        ...offer,
        validUntil: new Date(offer.validUntil),
        createdAt: new Date(offer.createdAt),
        updatedAt: offer.updatedAt ? new Date(offer.updatedAt) : undefined,
      }))),
      catchError((error) => {
        console.error(`Müşteri ID:${customerId} için teklifler getirilirken hata oluştu`, error);
        return of([]);
      })
    );
  }

  // Fırsat ID'sine göre teklifleri getir
  getOffersByOpportunityId(opportunityId: number): Observable<Offer[]> {
    console.log(`Fırsata ait teklifler API'den getiriliyor, Fırsat ID: ${opportunityId}`);
    return this.http.get<Offer[]>(`${this.apiUrl}?opportunityId=${opportunityId}`).pipe(
      map((offers) => offers.map(offer => ({
        ...offer,
        validUntil: new Date(offer.validUntil),
        createdAt: new Date(offer.createdAt),
        updatedAt: offer.updatedAt ? new Date(offer.updatedAt) : undefined,
      }))),
      catchError((error) => {
        console.error(`Fırsat ID:${opportunityId} için teklifler getirilirken hata oluştu`, error);
        return of([]);
      })
    );
  }

  // Yeni teklif ekle
  addOffer(offer: Offer): Observable<Offer> {
    console.log('Yeni teklif API\'ye ekleniyor:', offer);
    return this.http.post<Offer>(this.apiUrl, offer).pipe(
      map((newOffer) => ({
        ...newOffer,
        validUntil: new Date(newOffer.validUntil),
        createdAt: new Date(newOffer.createdAt),
        updatedAt: newOffer.updatedAt ? new Date(newOffer.updatedAt) : undefined,
      })),
      tap((newOffer) => {
        this.offers.update((offers) => [...offers, newOffer]);
      }),
      catchError((error) => {
        console.error('Teklif eklenirken hata oluştu', error);
        return throwError(() => new Error('Teklif eklenirken hata oluştu'));
      })
    );
  }

  // Teklif güncelle
  updateOffer(updatedOffer: Offer): Observable<Offer> {
    console.log(
      `Teklif API'de güncelleniyor, ID: ${updatedOffer.id}`,
      updatedOffer
    );
    return this.http
      .patch<Offer>(`${this.apiUrl}/${updatedOffer.id}`, updatedOffer)
      .pipe(
        map((offer) => ({
          ...offer,
          validUntil: new Date(offer.validUntil),
          createdAt: new Date(offer.createdAt),
          updatedAt: offer.updatedAt ? new Date(offer.updatedAt) : undefined,
        })),
        tap((offer) => {
          this.offers.update((offers) =>
            offers.map((o) => (o.id === offer.id ? offer : o))
          );
        }),
        catchError((error) => {
          console.error('Teklif güncellenirken hata oluştu', error);
          return throwError(
            () => new Error('Teklif güncellenirken hata oluştu')
          );
        })
      );
  }

  // Teklif sil
  deleteOffer(id: number): Observable<void> {
    console.log(`Teklif API'den siliniyor, ID: ${id}`);
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.offers.update((offers) =>
          offers.filter((offer) => offer.id !== id)
        );
      }),
      catchError((error) => {
        console.error('Teklif silinirken hata oluştu', error);
        return throwError(() => new Error('Teklif silinirken hata oluştu'));
      })
    );
  }
}
