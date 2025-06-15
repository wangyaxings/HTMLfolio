import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DropdownModule } from 'primeng/dropdown';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { I18nService, Language } from './services/i18n.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ButtonModule, TooltipModule, DropdownModule, CommonModule, FormsModule],
  providers: [MessageService, I18nService],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode">
      <!-- Modern Header -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand-section">
            <div class="logo">
              <img src="assets/HTMLfolio.png" alt="HTMLfolio Icon" class="logo-icon">
              <div class="brand-content">
                <img src="assets/HTMLfolioText.png" alt="HTMLfolio" class="logo-text">
                <span class="app-subtitle">{{ i18n.t('appSubtitle') }}</span>
              </div>
            </div>
          </div>

          <div class="header-actions">
            <!-- GitHub Link -->
            <a href="https://github.com/wangyaxings"
               target="_blank"
               rel="noopener noreferrer"
               class="github-link"
               [pTooltip]="'Visit GitHub Profile'"
               tooltipPosition="bottom">
              <i class="fab fa-github github-icon"></i>
            </a>

            <!-- Language Selector -->
            <p-dropdown
              [options]="languages"
              [(ngModel)]="selectedLanguage"
              optionLabel="name"
              optionValue="code"
              [showClear]="false"
              styleClass="language-dropdown"
              (onChange)="onLanguageChange($event)"
              [pTooltip]="i18n.t('language')"
              tooltipPosition="bottom">
              <ng-template pTemplate="selectedItem">
                <div class="language-item">
                  <span>{{ getSelectedLanguage()?.flag }}</span>
                  <span>{{ getSelectedLanguage()?.name }}</span>
                </div>
              </ng-template>
              <ng-template let-language pTemplate="item">
                <div class="language-item">
                  <span>{{ language.flag }}</span>
                  <span>{{ language.name }}</span>
                </div>
              </ng-template>
            </p-dropdown>

            <button pButton pRipple
                    type="button"
                    class="theme-toggle-btn"
                    [pTooltip]="i18n.t('toggleTheme')"
                    tooltipPosition="bottom"
                    (click)="toggleDarkMode()">
              <i [class]="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"
                  [style.color]="isDarkMode ? '#fbbf24' : '#6366f1'"></i>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content" [class.viewer-page]="router.url.startsWith('/view')">
        <router-outlet></router-outlet>
      </main>

      <!-- Professional Footer -->
      <footer class="app-footer">
        <div class="footer-container">
          <div class="footer-content">
            <p class="copyright">© 2025 HTML Viewer. All rights reserved.</p>
            <p class="footer-meta">Professional HTML Preview & Analysis Tool</p>
          </div>
        </div>
      </footer>

      <!-- Toast Notifications -->
      <p-toast position="top-right" [life]="5000"></p-toast>
    </div>
  `,
    styles: [`
    /* CSS Custom Properties for consistent design tokens */
    :root {
      --primary-color: #6366f1;
      --primary-color-rgb: 99, 102, 241;
      --surface-a: rgba(255, 255, 255, 0.95);
      --surface-b: #f8fafc;
      --surface-c: #f1f5f9;
      --surface-d: #e2e8f0;
      --text-color: #1e293b;
      --text-color-muted: #475569;
      --text-color-subtle: #64748b;
      --border-color: #e2e8f0;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --transition-duration: 0.2s;
      --transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
      --header-height: 4rem;
      --footer-height: 4rem;
      --container-max-width: 1200px;
      --spacing-2: 0.5rem;
      --spacing-3: 0.75rem;
      --spacing-4: 1rem;
      --spacing-6: 1.5rem;
      --font-size-xs: 0.75rem;
      --font-size-sm: 0.875rem;
      --font-size-lg: 1.125rem;
      --font-size-xl: 1.25rem;
      --font-weight-medium: 500;
      --font-weight-bold: 700;
      --border-radius-full: 9999px;
      --border-radius-md: 0.75rem;
      --spacing-1: 0.25rem;
    }

    /* Dark theme custom properties */
    .dark-theme {
      --surface-a: rgba(20, 20, 20, 0.95);
      --surface-b: #0f172a;
      --surface-c: #1e293b;
      --surface-d: #334155;
      --text-color: #f1f5f9;
      --text-color-muted: #cbd5e1;
      --text-color-subtle: #94a3b8;
      --border-color: #334155;
    }

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
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);
      border-radius: var(--border-radius-md);
      padding: var(--spacing-1);
    }

    .logo:hover {
      background: var(--surface-b);
      transform: scale(1.02);
    }

    .logo-icon {
      width: 2rem;
      height: 2rem;
      transition: transform var(--transition-duration) var(--transition-timing);
    }

    .logo:hover .logo-icon {
      transform: rotate(5deg);
    }

    .brand-content {
      display: flex;
      flex-direction: column;
    }

    .logo-text {
      width: 10rem;
      height: 2rem;
      object-fit: contain;
      filter: contrast(1.1);
      transition: filter var(--transition-duration) var(--transition-timing);
    }

    .logo:hover .logo-text {
      filter: contrast(1.2) brightness(1.05);
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

    /* GitHub Link Styles */
    .github-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--border-radius-full);
      background: var(--surface-c);
      border: 1px solid var(--border-color);
      text-decoration: none;
      transition: all var(--transition-duration) var(--transition-timing);
      color: var(--text-color);
    }

    .github-link:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: white;
      transform: scale(1.05);
    }

    .github-icon {
      font-size: 1.25rem;
      color: inherit;
    }

    /* Language Dropdown Styles */
    .language-dropdown {
      min-width: 120px !important;
    }

    .language-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
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
      min-height: calc(100vh - var(--header-height) - var(--footer-height));
    }

    /* 普通页面的padding */
    .main-content:not(.viewer-page) {
      padding: var(--spacing-6) 0;
    }

    /* viewer页面移除padding，使其完全填充 */
    .main-content.viewer-page {
      padding: 0;
      height: calc(100vh - var(--header-height) - var(--footer-height));
      overflow: hidden;
    }

    /* Footer Styles */
    .app-footer {
      background: var(--surface-a);
      border-top: 1px solid var(--border-color);
      padding: var(--spacing-4) 0;
    }

    .footer-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--spacing-6);
    }

    .footer-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .copyright {
      font-size: var(--font-size-sm);
      color: var(--text-color);
      font-weight: var(--font-weight-medium);
      margin: 0;
    }

    .footer-meta {
      font-size: var(--font-size-xs);
      color: var(--text-color-muted);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Dark Theme Specific Styles */
    .dark-theme .app-header {
      background: rgba(30, 30, 30, 0.95);
      border-bottom-color: var(--border-color);
    }

    .dark-theme .app-footer {
      background: rgba(30, 30, 30, 0.95);
      border-top-color: var(--border-color);
    }

    .dark-theme .theme-toggle-btn {
      background: var(--surface-d) !important;
      border-color: var(--border-color) !important;
    }

    .dark-theme .github-link {
      background: var(--surface-d);
      border-color: var(--border-color);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-container,
      .footer-container {
        padding: 0 var(--spacing-4);
      }

      .logo-text {
        width: 8rem;
        height: 1.5rem;
      }

      .brand-content {
        display: flex;
      }

      .logo {
        gap: var(--spacing-2);
      }

      .main-content {
        padding: var(--spacing-4) 0;
      }

      .language-dropdown {
        min-width: 100px !important;
      }

      .footer-content {
        text-align: center;
      }
    }

    @media (max-width: 480px) {
      .app-subtitle {
        display: none;
      }

      .logo-icon {
        width: 1.5rem;
        height: 1.5rem;
      }

      .logo-text {
        width: 6rem;
        height: 1.2rem;
      }

      .language-item span:last-child {
        display: none;
      }

      .header-actions {
        gap: var(--spacing-2);
      }

      .github-link,
      .theme-toggle-btn {
        width: 2rem !important;
        height: 2rem !important;
      }

      .github-icon {
        font-size: 1rem;
      }
    }

    /* High Contrast Support for Accessibility */
    @media (prefers-contrast: high) {
      .app-container {
        --text-color: #000000;
        --text-color-muted: #333333;
        --border-color: #000000;
      }

      .dark-theme {
        --text-color: #ffffff;
        --text-color-muted: #cccccc;
        --border-color: #ffffff;
      }
    }

    /* Focus indicators for accessibility */
    .github-link:focus,
    .theme-toggle-btn:focus {
      outline: 2px solid var(--primary-color);
      outline-offset: 2px;
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
  languages: Language[] = [];
  selectedLanguage = 'en';

  constructor(public i18n: I18nService, public router: Router) {
    this.languages = this.i18n.getLanguages();
    this.selectedLanguage = this.i18n.getCurrentLanguage();
  }

  ngOnInit() {
    this.languages = this.i18n.getLanguages();
    this.selectedLanguage = this.i18n.getCurrentLanguage();

    const savedTheme = localStorage.getItem('theme');
    this.isDarkMode = savedTheme === 'dark';
    this.applyTheme();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const url = event.url;
      if (url.startsWith('/view')) {
        document.body.classList.add('viewer-page');
      } else {
        document.body.classList.remove('viewer-page');
      }
    });

    // 初始检查当前路由
    const currentUrl = this.router.url;
    if (currentUrl.startsWith('/view')) {
      document.body.classList.add('viewer-page');
    }
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('theme-preference', this.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  }

  onLanguageChange(event: any) {
    this.i18n.setLanguage(event.value);
    this.selectedLanguage = event.value;
  }

  getSelectedLanguage(): Language | undefined {
    return this.languages.find(lang => lang.code === this.selectedLanguage);
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