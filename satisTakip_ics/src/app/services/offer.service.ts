import { Injectable, signal } from '@angular/core';
import { Offer } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OfferService {
  private offers = signal<Offer[]>([
    {
      id: 1,
      offerNumber: 'TKL-2023-001',
      customerId: 1,
      customerName: 'Yılmaz Teknoloji A.Ş.',
      title: 'ERP Sistemi Teklifi',
      description: 'Şirket içi süreçleri yönetmek için ERP sistemi teklifi',
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
        {
          id: 3,
          productName: 'İnsan Kaynakları Modülü',
          quantity: 1,
          unitPrice: 60000,
          discount: 5,
          tax: 18,
          total: 57000,
          description: 'İK yönetim modülü',
        },
      ],
      totalAmount: 194500,
      status: 'sent',
      validUntil: new Date('2023-07-30'),
      createdAt: new Date('2023-05-15'),
      notes: 'Müşteri ile görüşüldü, olumlu dönüş bekleniyor',
      terms: 'Ödeme 30 gün içinde yapılmalıdır',
      opportunityId: 1,
    },
    {
      id: 2,
      offerNumber: 'TKL-2023-002',
      customerId: 2,
      customerName: 'Demir İnşaat Ltd. Şti.',
      title: 'Mobil Uygulama Geliştirme Teklifi',
      description: 'Saha ekibi için mobil takip uygulaması geliştirme teklifi',
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
        {
          id: 2,
          productName: 'Bulut Altyapı Kurulumu',
          quantity: 1,
          unitPrice: 40000,
          tax: 18,
          total: 40000,
          description: 'Uygulama için bulut altyapı kurulumu ve yapılandırması',
        },
      ],
      totalAmount: 120000,
      status: 'draft',
      validUntil: new Date('2023-08-15'),
      createdAt: new Date('2023-05-20'),
      opportunityId: 2,
    },
  ]);

  getOffers() {
    return this.offers;
  }

  getOfferById(id: number) {
    return this.offers().find((offer) => offer.id === id);
  }

  getOffersByCustomerId(customerId: number) {
    return this.offers().filter((offer) => offer.customerId === customerId);
  }

  addOffer(offer: Offer) {
    const newOffer = {
      ...offer,
      id: this.generateId(),
      offerNumber: this.generateOfferNumber(),
      createdAt: new Date(),
    };

    this.offers.update((offers) => [...offers, newOffer]);
    return newOffer;
  }

  updateOffer(updatedOffer: Offer) {
    this.offers.update((offers) =>
      offers.map((offer) =>
        offer.id === updatedOffer.id
          ? { ...updatedOffer, updatedAt: new Date() }
          : offer
      )
    );
  }

  deleteOffer(id: number) {
    this.offers.update((offers) => offers.filter((offer) => offer.id !== id));
  }

  private generateId(): number {
    const offers = this.offers();
    return offers.length > 0
      ? Math.max(...offers.map((offer) => offer.id || 0)) + 1
      : 1;
  }

  private generateOfferNumber(): string {
    const offers = this.offers();
    const year = new Date().getFullYear();
    const lastOfferNumber =
      offers
        .filter((offer) => offer.offerNumber.includes(`TKL-${year}`))
        .map((offer) => parseInt(offer.offerNumber.split('-')[2]))
        .sort((a, b) => b - a)[0] || 0;

    return `TKL-${year}-${(lastOfferNumber + 1).toString().padStart(3, '0')}`;
  }
}
