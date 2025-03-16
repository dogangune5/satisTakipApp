import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge rounded-pill" [ngClass]="badgeClass">
      {{ text }}
    </span>
  `,
  styles: [
    `
      .badge {
        font-weight: 500;
        padding: 0.5em 0.8em;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input() status: string | undefined = '';
  @Input() type: 'customer' | 'opportunity' | 'offer' | 'order' | 'payment' =
    'customer';

  get text(): string {
    const currentStatus = this.status || '';

    switch (this.type) {
      case 'customer':
        switch (currentStatus) {
          case 'active':
            return 'Aktif';
          case 'inactive':
            return 'Pasif';
          case 'lead':
            return 'Potansiyel';
          default:
            return currentStatus;
        }
      case 'opportunity':
        switch (currentStatus) {
          case 'new':
            return 'Yeni';
          case 'qualified':
            return 'Nitelikli';
          case 'proposition':
            return 'Teklif Aşaması';
          case 'negotiation':
            return 'Pazarlık';
          case 'closed-won':
            return 'Kazanıldı';
          case 'closed-lost':
            return 'Kaybedildi';
          default:
            return currentStatus;
        }
      case 'offer':
        switch (currentStatus) {
          case 'draft':
            return 'Taslak';
          case 'sent':
            return 'Gönderildi';
          case 'accepted':
            return 'Kabul Edildi';
          case 'rejected':
            return 'Reddedildi';
          case 'expired':
            return 'Süresi Doldu';
          case 'pending':
            return 'Beklemede';
          default:
            return currentStatus;
        }
      case 'order':
        switch (currentStatus) {
          case 'new':
            return 'Yeni';
          case 'processing':
            return 'İşleniyor';
          case 'shipped':
            return 'Gönderildi';
          case 'delivered':
            return 'Teslim Edildi';
          case 'cancelled':
            return 'İptal Edildi';
          default:
            return currentStatus;
        }
      case 'payment':
        switch (currentStatus) {
          case 'pending':
            return 'Bekliyor';
          case 'completed':
            return 'Tamamlandı';
          case 'failed':
            return 'Başarısız';
          case 'refunded':
            return 'İade Edildi';
          default:
            return currentStatus;
        }
      default:
        return currentStatus;
    }
  }

  get badgeClass(): string {
    const currentStatus = this.status || '';

    switch (this.type) {
      case 'customer':
        switch (currentStatus) {
          case 'active':
            return 'bg-success';
          case 'inactive':
            return 'bg-secondary';
          case 'lead':
            return 'bg-info';
          default:
            return 'bg-primary';
        }
      case 'opportunity':
        switch (currentStatus) {
          case 'new':
            return 'bg-info';
          case 'qualified':
            return 'bg-primary';
          case 'proposition':
            return 'bg-warning text-dark';
          case 'negotiation':
            return 'bg-warning text-dark';
          case 'closed-won':
            return 'bg-success';
          case 'closed-lost':
            return 'bg-danger';
          default:
            return 'bg-primary';
        }
      case 'offer':
        switch (currentStatus) {
          case 'draft':
            return 'bg-secondary';
          case 'sent':
            return 'bg-info';
          case 'accepted':
            return 'bg-success';
          case 'rejected':
            return 'bg-danger';
          case 'expired':
            return 'bg-dark';
          case 'pending':
            return 'bg-warning text-dark';
          default:
            return 'bg-primary';
        }
      case 'order':
        switch (currentStatus) {
          case 'new':
            return 'bg-info';
          case 'processing':
            return 'bg-warning text-dark';
          case 'shipped':
            return 'bg-primary';
          case 'delivered':
            return 'bg-success';
          case 'cancelled':
            return 'bg-danger';
          default:
            return 'bg-primary';
        }
      case 'payment':
        switch (currentStatus) {
          case 'pending':
            return 'bg-warning text-dark';
          case 'completed':
            return 'bg-success';
          case 'failed':
            return 'bg-danger';
          case 'refunded':
            return 'bg-info';
          default:
            return 'bg-primary';
        }
      default:
        return 'bg-primary';
    }
  }
}
