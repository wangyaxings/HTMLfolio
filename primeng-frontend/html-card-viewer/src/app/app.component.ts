import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ButtonModule, TooltipModule, CommonModule],
  providers: [MessageService],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <!-- Modern Header -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand-section">
            <div class="logo">
              <i class="pi pi-file-o logo-icon"></i>
              <div class="brand-text">
                <h1 class="app-title">HTML Viewer</h1>
                <span class="app-subtitle">Organize with style</span>
              </div>
            </div>
          </div>

                    <div class="header-actions">            <button pButton pRipple                    type="button"                    class="theme-toggle-btn"                    [pTooltip]="isDarkMode ? '切换到浅色模式' : '切换到深色模式'"                    tooltipPosition="bottom"                    (click)="toggleDarkMode()">              <i [class]="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"                  [style.color]="isDarkMode ? '#fbbf24' : '#6366f1'"></i>            </button>          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Minimal Footer -->
      <footer class="app-footer">
        <div class="footer-container">
          <p class="copyright">© 2025 HTML Viewer - Crafted with ❤️</p>
        </div>
      </footer>

      <!-- Toast Notifications -->
      <p-toast position="top-right" [life]="5000"></p-toast>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: linear-gradient(135deg, var(--surface-b) 0%, var(--surface-c) 100%);
      transition: all var(--transition-duration) var(--transition-timing);
    }

    /* Header Styles */
    .app-header {
      background: var(--surface-a);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: var(--shadow-sm);
    }

    .header-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--spacing-6);
      height: var(--header-height);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-section {
      display: flex;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .logo-icon {
      font-size: 2rem;
      color: var(--primary-color);
      filter: drop-shadow(0 2px 4px rgba(var(--primary-color-rgb), 0.3));
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .app-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin: 0;
      line-height: 1.2;
    }

    .app-subtitle {
      font-size: var(--font-size-xs);
      color: var(--text-color-muted);
      font-weight: var(--font-weight-medium);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .theme-toggle-btn {
      width: 2.5rem !important;
      height: 2.5rem !important;
      border-radius: var(--border-radius-full) !important;
      background: var(--surface-c) !important;
      border: 1px solid var(--border-color) !important;
      color: var(--text-color) !important;
      transition: all var(--transition-duration) var(--transition-timing) !important;
    }

    .theme-toggle-btn:hover {
      background: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      color: white !important;
      transform: scale(1.05);
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: var(--spacing-6) 0;
      min-height: calc(100vh - var(--header-height) - var(--footer-height));
    }

    /* Footer */
    .app-footer {
      background: var(--surface-a);
      border-top: 1px solid var(--border-color);
      padding: var(--spacing-4) 0;
    }

    .footer-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--spacing-6);
      text-align: center;
    }

    .copyright {
      font-size: var(--font-size-sm);
      color: var(--text-color-muted);
      margin: 0;
    }

    /* Dark Theme Specific Styles */
    .dark-theme .app-header {
      background: rgba(30, 30, 30, 0.9);
      border-bottom-color: var(--border-color);
    }

    .dark-theme .app-footer {
      background: rgba(30, 30, 30, 0.9);
      border-top-color: var(--border-color);
    }

    .dark-theme .theme-toggle-btn {
      background: var(--surface-d) !important;
      border-color: var(--border-color) !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-container,
      .footer-container {
        padding: 0 var(--spacing-4);
      }

      .app-title {
        font-size: var(--font-size-lg);
      }

      .brand-text {
        display: none;
      }

      .logo {
        gap: var(--spacing-2);
      }

      .main-content {
        padding: var(--spacing-4) 0;
      }
    }

    @media (max-width: 480px) {
      .app-subtitle {
        display: none;
      }

      .logo-icon {
        font-size: 1.5rem;
      }
    }

    /* Smooth transitions for all interactive elements */
    .app-container * {
      transition: color var(--transition-duration) var(--transition-timing),
                  background-color var(--transition-duration) var(--transition-timing),
                  border-color var(--transition-duration) var(--transition-timing);
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'html-card-viewer';
  isDarkMode = false;

  ngOnInit() {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('theme-preference');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme-preference', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  private applyTheme() {
    const root = document.documentElement;
    const body = document.body;

    if (this.isDarkMode) {
      root.classList.add('dark-theme');
      body.classList.add('dark-theme');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark-theme');
      body.classList.remove('dark-theme');
      root.setAttribute('data-theme', 'light');
    }
  }
}