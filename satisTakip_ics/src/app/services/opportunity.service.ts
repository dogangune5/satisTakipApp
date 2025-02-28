import { Injectable, signal } from '@angular/core';
import { Opportunity } from '../models';

@Injectable({
  providedIn: 'root',
})
export class OpportunityService {
  private opportunities = signal<Opportunity[]>([
    {
      id: 1,
      title: 'ERP Sistemi Satışı',
      customerId: 1,
      customerName: 'Yılmaz Teknoloji A.Ş.',
      description: 'Şirket içi süreçleri yönetmek için ERP sistemi ihtiyacı',
      value: 250000,
      status: 'qualified',
      probability: 70,
      expectedCloseDate: new Date('2023-06-30'),
      createdAt: new Date('2023-04-15'),
      assignedTo: 'Serkan Yücel',
      products: ['ERP Temel Modül', 'Finans Modülü', 'İnsan Kaynakları Modülü'],
      priority: 'high',
    },
    {
      id: 2,
      title: 'Mobil Uygulama Geliştirme',
      customerId: 2,
      customerName: 'Demir İnşaat Ltd. Şti.',
      description: 'Saha ekibi için mobil takip uygulaması',
      value: 120000,
      status: 'proposition',
      probability: 50,
      expectedCloseDate: new Date('2023-07-15'),
      createdAt: new Date('2023-05-01'),
      assignedTo: 'Ayşe Kara',
      products: ['Mobil Uygulama', 'Bulut Altyapı'],
      priority: 'medium',
    },
    {
      id: 3,
      title: 'Filo Yönetim Sistemi',
      customerId: 3,
      customerName: 'Kaya Otomotiv',
      description: 'Araç filosu için takip ve yönetim sistemi',
      value: 85000,
      status: 'new',
      probability: 30,
      expectedCloseDate: new Date('2023-08-20'),
      createdAt: new Date('2023-05-10'),
      assignedTo: 'Mehmet Demir',
      products: ['Filo Takip Yazılımı', 'GPS Entegrasyonu'],
      priority: 'low',
    },
  ]);

  getOpportunities() {
    return this.opportunities;
  }

  getOpportunityById(id: number) {
    return this.opportunities().find((opportunity) => opportunity.id === id);
  }

  getOpportunitiesByCustomerId(customerId: number) {
    return this.opportunities().filter(
      (opportunity) => opportunity.customerId === customerId
    );
  }

  addOpportunity(opportunity: Opportunity) {
    const newOpportunity = {
      ...opportunity,
      id: this.generateId(),
      createdAt: new Date(),
    };

    this.opportunities.update((opportunities) => [
      ...opportunities,
      newOpportunity,
    ]);
    return newOpportunity;
  }

  updateOpportunity(updatedOpportunity: Opportunity) {
    this.opportunities.update((opportunities) =>
      opportunities.map((opportunity) =>
        opportunity.id === updatedOpportunity.id
          ? { ...updatedOpportunity, updatedAt: new Date() }
          : opportunity
      )
    );
  }

  deleteOpportunity(id: number) {
    this.opportunities.update((opportunities) =>
      opportunities.filter((opportunity) => opportunity.id !== id)
    );
  }

  private generateId(): number {
    const opportunities = this.opportunities();
    return opportunities.length > 0
      ? Math.max(...opportunities.map((opportunity) => opportunity.id || 0)) + 1
      : 1;
  }
}
