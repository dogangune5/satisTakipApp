import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" routerLink="/">
          <i class="bi bi-graph-up-arrow me-2"></i>
          SatışTakip
        </a>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/dashboard"
                routerLinkActive="active"
              >
                <i class="bi bi-speedometer2 me-1"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/customers"
                routerLinkActive="active"
              >
                <i class="bi bi-people me-1"></i> Müşteriler
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/opportunities"
                routerLinkActive="active"
              >
                <i class="bi bi-lightning me-1"></i> Fırsatlar
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/offers"
                routerLinkActive="active"
              >
                <i class="bi bi-file-earmark-text me-1"></i> Teklifler
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/orders"
                routerLinkActive="active"
              >
                <i class="bi bi-cart me-1"></i> Siparişler
              </a>
            </li>
            <li class="nav-item">
              <a
                class="nav-link"
                routerLink="/payments"
                routerLinkActive="active"
              >
                <i class="bi bi-cash-coin me-1"></i> Ödemeler
              </a>
            </li>
          </ul>
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i class="bi bi-person-circle me-1"></i> Admin
              </a>
              <ul
                class="dropdown-menu dropdown-menu-end"
                aria-labelledby="navbarDropdown"
              >
                <li>
                  <a class="dropdown-item" href="#"
                    ><i class="bi bi-gear me-1"></i> Ayarlar</a
                  >
                </li>
                <li>
                  <a class="dropdown-item" href="#"
                    ><i class="bi bi-person me-1"></i> Profil</a
                  >
                </li>
                <li><hr class="dropdown-divider" /></li>
                <li>
                  <a class="dropdown-item" href="#"
                    ><i class="bi bi-box-arrow-right me-1"></i> Çıkış</a
                  >
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `,
  styles: [
    `
      .navbar {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .navbar-brand {
        font-weight: 600;
        font-size: 1.3rem;
      }

      .nav-link {
        font-weight: 500;
        padding: 0.5rem 1rem;
        transition: all 0.3s ease;
      }

      .nav-link:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .nav-link.active {
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 4px;
      }
    `,
  ],
})
export class NavbarComponent {}
