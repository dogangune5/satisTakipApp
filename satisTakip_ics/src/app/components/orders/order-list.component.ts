import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { Order } from '../../models/order.model';

declare var bootstrap: any;

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './order-list.component.html',
  styles: [
    `
      .table th {
        font-weight: 600;
        background-color: #f8f9fa;
      }

      .badge {
        font-size: 0.8rem;
      }

      .alert {
        margin-top: 1rem;
      }
    `,
  ],
})
export class OrderListComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  searchTerm: string = '';
  statusFilter: string = 'all';
  orderToDelete: Order | null = null;
  deleteModal: any;
  errorMessage: string = '';
  isLoading: boolean = true;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('Siparişler yükleniyor...');
    this.orderService.fetchOrders().subscribe({
      next: (orders) => {
        console.log('Siparişler yüklendi:', orders);
        this.orders = orders;
        this.filteredOrders = orders;
        this.applyFilters();
        this.isLoading = false;

        // API'den veri gelmedi ama hata da olmadı
        if (orders.length === 0) {
          this.errorMessage =
            "Henüz sipariş kaydı bulunmuyor veya backend API endpoint'i (/api/orders) henüz oluşturulmamış. Backend'de Orders modülü eklenmeli.";
        }
      },
      error: (err) => {
        console.error('Siparişler yüklenirken hata oluştu:', err);
        this.isLoading = false;

        if (err.status === 404) {
          this.errorMessage =
            "Sipariş API endpoint'i bulunamadı. Backend'de Orders modülü ve /api/orders endpoint'i oluşturulmalı. Nest.js backend'de \"nest generate resource orders\" komutu ile oluşturabilirsiniz.";
        } else {
          this.errorMessage = `Siparişler yüklenirken bir hata oluştu: ${
            err.message || 'Bilinmeyen hata'
          }`;
        }
      },
    });
  }

  search(): void {
    this.applyFilters();
  }

  filterByStatus(status: string): void {
    this.statusFilter = status;
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.orders;

    // Apply status filter
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm.trim() !== '') {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (order) =>
          (order.orderNumber &&
            order.orderNumber.toLowerCase().includes(term)) ||
          (order.customerName &&
            order.customerName.toLowerCase().includes(term))
      );
    }

    this.filteredOrders = filtered;
  }

  prepareDelete(order: Order): void {
    this.orderToDelete = order;

    // Initialize modal if not already done
    if (!this.deleteModal) {
      const modalElement = document.getElementById('deleteOrderModal');
      if (modalElement) {
        this.deleteModal = new bootstrap.Modal(modalElement);
      }
    }

    // Show modal
    if (this.deleteModal) {
      this.deleteModal.show();
    }
  }

  deleteOrder(): void {
    if (this.orderToDelete && this.orderToDelete.id) {
      console.log(`Sipariş siliniyor, ID: ${this.orderToDelete.id}`);
      this.orderService.deleteOrder(this.orderToDelete.id).subscribe({
        next: () => {
          console.log('Sipariş başarıyla silindi');
          this.loadOrders();
          if (this.deleteModal) {
            this.deleteModal.hide();
          }
        },
        error: (err) => {
          console.error('Sipariş silinirken hata oluştu:', err);
          if (this.deleteModal) {
            this.deleteModal.hide();
          }

          if (err.status === 404) {
            this.errorMessage =
              "Sipariş silme API endpoint'i bulunamadı. Backend'de /api/orders/:id endpoint'i oluşturulmalı.";
          } else {
            this.errorMessage = `Sipariş silinirken bir hata oluştu: ${
              err.message || 'Bilinmeyen hata'
            }`;
          }
        },
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'new':
        return 'bg-primary';
      case 'processing':
        return 'bg-info';
      case 'shipped':
        return 'bg-warning';
      case 'delivered':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
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
        return status;
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-success';
      case 'partial':
        return 'bg-warning';
      case 'pending':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getPaymentStatusText(status: string): string {
    switch (status) {
      case 'paid':
        return 'Ödendi';
      case 'partial':
        return 'Kısmi Ödeme';
      case 'pending':
        return 'Bekliyor';
      default:
        return status;
    }
  }
}
