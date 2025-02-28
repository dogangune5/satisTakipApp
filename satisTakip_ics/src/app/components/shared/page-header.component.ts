import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1 class="page-title">{{ title }}</h1>
          @if (subtitle) {
          <p class="text-muted">{{ subtitle }}</p>
          }
        </div>
        <div>
          <ng-content></ng-content>
        </div>
      </div>
      <hr class="my-2" />
    </div>
  `,
  styles: [
    `
      .page-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 0.2rem;
      }

      .page-header {
        margin-top: 1.5rem;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
