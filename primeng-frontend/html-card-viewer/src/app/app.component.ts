import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ButtonModule, CommonModule],
  providers: [MessageService],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <!-- Top Navigation Bar -->
      <header class="navbar">
        <div class="navbar-container">
          <div class="navbar-brand">
            <i class="pi pi-file-o logo-icon"></i>
            <h1 class="navbar-title">HTML Card Viewer</h1>
          </div>
          <div class="navbar-actions">
            <div class="theme-toggle">
              <button pButton pRipple
                      type="button"
                      [icon]="isDarkMode ? 'pi pi-sun' : 'pi pi-moon'"
                      class="p-button-text p-button-rounded"
                      pTooltip="Toggle Dark Mode"
                      tooltipPosition="bottom"
                      (click)="toggleDarkMode()"></button>
            </div>
            <a href="https://github.com/your-username/html-card-viewer"
               target="_blank"
               class="github-link">
              <i class="pi pi-github"></i>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="content">
        <div class="page-container">
          <router-outlet></router-outlet>
        </div>
      </main>

      <!-- Footer -->
      <footer class="footer">
        <div class="footer-content">
          <p class="footer-copyright">© 2025 HTML Card Viewer - Organize your HTML files efficiently</p>
        </div>
      </footer>

      <!-- Global Message Toast -->
      <p-toast position="top-right"></p-toast>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      transition: background-color 0.3s ease;
    }

    .dark-theme {
      background-color: #1a1a1a;
      color: #e0e0e0;
    }

    /* Navigation Bar Styles */
    .navbar {
      background-color: var(--surface-a);
      box-shadow: var(--shadow-md);
      position: sticky;
      top: 0;
      z-index: 100;
      height: var(--header-height);
      border-bottom: 1px solid var(--border-color);
    }

    .dark-theme .navbar {
      background-color: #2a2a2a;
      border-bottom-color: #3a3a3a;
    }

    .navbar-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-6);
      height: 100%;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
    }

    .logo-icon {
      font-size: 1.8rem;
      color: var(--primary-color);
      margin-right: var(--spacing-3);
    }

    .navbar-title {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
    }

    .dark-theme .navbar-title {
      color: #e0e0e0;
    }

    .navbar-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .theme-toggle {
      display: flex;
      align-items: center;
    }

    .github-link {
      display: flex;
      align-items: center;
      color: var(--text-secondary-color);
      text-decoration: none;
      font-size: var(--font-size-sm);
      transition: color var(--transition-duration) var(--transition-timing);
      border-radius: var(--border-radius);
      padding: var(--spacing-2) var(--spacing-3);
    }

    .github-link:hover {
      color: var(--primary-color);
      background-color: var(--surface-c);
      text-decoration: none;
    }

    .dark-theme .github-link {
      color: #b0b0b0;
    }

    .dark-theme .github-link:hover {
      background-color: #3a3a3a;
    }

    .github-link i {
      font-size: 1.2rem;
      margin-right: var(--spacing-2);
    }

    /* Main Content Area */
    .content {
      flex: 1;
      padding: var(--spacing-4) 0;
      background-color: var(--surface-b);
    }

    .dark-theme .content {
      background-color: #1a1a1a;
    }

    /* Footer Styles */
    .footer {
      background-color: var(--surface-a);
      padding: var(--spacing-3) 0;
      border-top: 1px solid var(--border-color);
      text-align: center;
    }

    .dark-theme .footer {
      background-color: #2a2a2a;
      border-top-color: #3a3a3a;
    }

    .footer-content {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-6);
    }

    .footer-copyright {
      margin: 0;
      color: var(--text-muted);
      font-size: var(--font-size-sm);
    }

    .dark-theme .footer-copyright {
      color: #888;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .navbar-title {
        font-size: var(--font-size-lg);
      }

      .navbar-container,
      .footer-content {
        padding: 0 var(--spacing-4);
      }

      .github-link span {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .navbar-title {
        font-size: var(--font-size-base);
      }

      .logo-icon {
        font-size: 1.5rem;
        margin-right: var(--spacing-2);
      }
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'html-card-viewer';
  isDarkMode = false;

  ngOnInit() {
    // Load dark mode preference from localStorage
    const savedTheme = localStorage.getItem('dark-mode');
    this.isDarkMode = savedTheme === 'true';
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('dark-mode', this.isDarkMode.toString());
    this.applyTheme();
  }

  private applyTheme() {
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}