import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent, FooterComponent } from './components/shared';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <app-navbar></app-navbar>
      <main class="flex-grow-1 py-3">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'Satış Takip';
}
