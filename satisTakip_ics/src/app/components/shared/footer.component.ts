import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer mt-auto py-3 bg-light">
      <div class="container text-center">
        <span class="text-muted">
          <i class="bi bi-graph-up-arrow me-2"></i>
          SatışTakip &copy; {{ currentYear }} | Tüm Hakları Saklıdır
        </span>
      </div>
    </footer>
  `,
  styles: [
    `
      .footer {
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
        margin-top: 2rem;
      }
    `,
  ],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
