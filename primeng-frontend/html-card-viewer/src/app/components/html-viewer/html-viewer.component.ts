import { Component, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';import { ActivatedRoute, Router } from '@angular/router';import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';import { HtmlFileService } from '../../services/html-file.service';import { I18nService } from '../../services/i18n.service';import { MessageService } from 'primeng/api';import { ButtonModule } from 'primeng/button';import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-html-viewer',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div class="viewer-wrapper">
      <div class="viewer-container">
        <!-- Viewer Header Toolbar -->
        <div class="viewer-header">
          <!-- 返回按钮在左侧 -->
          <div class="header-left">
            <button pButton pRipple
                    icon="pi pi-arrow-left"
                    [pTooltip]="i18n.t('back')"
                    tooltipPosition="bottom"
                    class="p-button-text p-button-lg back-button"
                    (click)="goBack()"></button>
          </div>

          <div class="header-center">
            <h2 *ngIf="fileTitle">{{ fileTitle }}</h2>
          </div>

          <div class="header-actions" *ngIf="fileUrl">
            <button pButton pRipple
                    icon="pi pi-copy"
                    [pTooltip]="i18n.t('copyPath')"
                    tooltipPosition="bottom"
                    class="p-button-text p-button-secondary"
                    (click)="copyHtmlPath()"></button>
            <button pButton pRipple
                    icon="pi pi-external-link"
                    [pTooltip]="i18n.t('openNewTab')"
                    tooltipPosition="bottom"
                    class="p-button-text p-button-secondary"
                    (click)="openInNewTab()"></button>
          </div>
        </div>

        <!-- Viewer Content Area -->
        <div class="viewer-content">
          <!-- Loading State -->
          <div *ngIf="isLoading" class="loading-state">
            <div class="loading-spinner">
              <i class="pi pi-spin pi-spinner"></i>
            </div>
            <span>{{ i18n.t('loadingContent') }}</span>
          </div>

          <!-- HTML Content Preview -->
          <iframe *ngIf="fileUrl && !isLoading"
                 [src]="fileUrl"
                 class="html-frame"
                 sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                 (load)="onIframeLoaded()"></iframe>

          <!-- Error State -->
          <div *ngIf="!fileUrl && !isLoading" class="error-state">
            <div class="error-icon">
              <i class="pi pi-exclamation-circle"></i>
            </div>
            <h3>{{ i18n.t('fileNotFound') }}</h3>
            <p>{{ i18n.t('fileNotFoundMessage') }}</p>
            <div class="error-actions">
              <button pButton pRipple
                      [label]="i18n.t('goHome')"
                      icon="pi pi-home"
                      class="p-button-primary"
                      (click)="goHome()"></button>
              <button pButton pRipple
                      [label]="i18n.t('refresh')"
                      icon="pi pi-refresh"
                      class="p-button-outlined p-button-secondary"
                      (click)="reloadPage()"></button>
            </div>
          </div>
        </div>

        <!-- Viewer Footer Status Bar -->
        <div class="viewer-footer" *ngIf="fileUrl">
          <div class="footer-info">
            <i class="pi pi-link"></i>
            <span class="file-path">{{ rawUrl }}</span>
          </div>
          <!-- 删除了右下角的Go Home按钮 -->
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* 确保页面完全无滚动条 */
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
    }

    .viewer-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .viewer-container {
      width: calc(100% - 32px);
      height: calc(100% - 32px);
      margin: 16px;
      display: flex;
      flex-direction: column;
      background-color: var(--surface-a);
      border-radius: var(--border-radius-lg);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      border: 1px solid var(--border-color);
      box-sizing: border-box;
    }

    /* Viewer Header */
    .viewer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-4) var(--spacing-6);
      border-bottom: 1px solid var(--border-color);
      background: linear-gradient(135deg, var(--surface-a) 0%, var(--surface-b) 100%);
      backdrop-filter: blur(10px);
      flex-shrink: 0;
      height: auto;
      min-height: 60px;
      box-sizing: border-box;
    }

    /* 左侧返回按钮区域 */
    .header-left {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      width: 60px;
    }

    .header-left .back-button {
      border-radius: 50%;
      width: 40px;
      height: 40px;
      padding: 0;
      font-size: 1.2rem;
      transition: all 0.3s ease;
      background: transparent !important;
      border: none !important;
      color: var(--text-color) !important;
    }

    .header-left .back-button:hover {
      background: var(--highlight-bg) !important;
      transform: translateX(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .header-left .back-button:focus {
      box-shadow: 0 0 0 2px var(--focus-ring);
    }

    .header-center {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0 var(--spacing-4);
    }

    .header-center h2 {
      margin: 0;
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 400px;
      text-align: center;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      flex-shrink: 0;
      width: 100px;
      justify-content: flex-end;
    }

    .header-actions button {
      color: var(--text-color) !important;
    }

    .header-actions button:hover {
      background: var(--highlight-bg) !important;
    }

    /* Viewer Content */
    .viewer-content {
      flex: 1;
      overflow: hidden;
      position: relative;
      background-color: #f8f9fa;
      min-height: 0;
      box-sizing: border-box;
    }

    .html-frame {
      width: 100%;
      height: 100%;
      border: none;
      background-color: white;
      display: block;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    /* Loading State */
    .loading-state {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--surface-b) 0%, var(--surface-c) 100%);
      z-index: 10;
      box-sizing: border-box;
    }

    .loading-spinner {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-4);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .loading-state span {
      color: var(--text-color-secondary);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
    }

    /* Error State */
    .error-state {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-12) var(--spacing-6);
      background: linear-gradient(135deg, var(--surface-b) 0%, var(--surface-c) 100%);
      box-sizing: border-box;
    }

    .error-icon {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--danger-color-light) 0%, var(--danger-color) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-6);
      box-shadow: var(--shadow-lg);
    }

    .error-icon i {
      font-size: 3rem;
      color: white !important;
    }

    .error-state h3 {
      margin: 0 0 var(--spacing-3);
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
    }

    .error-state p {
      margin: 0 0 var(--spacing-8);
      color: var(--text-color-secondary);
      font-size: var(--font-size-lg);
      max-width: 400px;
      line-height: 1.5;
    }

    .error-actions {
      display: flex;
      gap: var(--spacing-3);
      flex-wrap: wrap;
      justify-content: center;
    }

    /* Viewer Footer */
    .viewer-footer {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      padding: var(--spacing-3) var(--spacing-6);
      border-top: 1px solid var(--border-color);
      background: var(--surface-a);
      font-size: var(--font-size-sm);
      flex-shrink: 0;
      height: auto;
      min-height: 60px;
      box-sizing: border-box;
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      color: var(--text-color-muted);
      flex: 1;
      min-width: 0;
    }

    .footer-info i {
      color: var(--primary-color) !important;
      flex-shrink: 0;
    }

    .file-path {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: 'Courier New', monospace;
      background: var(--surface-c);
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
      color: var(--text-color);
    }

    /* Dark Theme Support - 明确指定所有图标颜色 */
    .dark-theme .viewer-container {
      background-color: var(--surface-a);
      border-color: var(--border-color);
    }

    .dark-theme .viewer-header {
      background: linear-gradient(135deg, var(--surface-a) 0%, var(--surface-b) 100%);
      border-bottom-color: var(--border-color);
    }

    .dark-theme .viewer-content {
      background-color: var(--surface-b);
    }

    .dark-theme .html-frame {
      background-color: var(--surface-a);
    }

    .dark-theme .viewer-footer {
      background: var(--surface-a);
      border-top-color: var(--border-color);
    }

    .dark-theme .file-path {
      background: var(--surface-c);
      border-color: var(--border-color);
      color: var(--text-color);
    }

    /* Dark Theme - 明确设置所有图标和按钮的颜色 */
    .dark-theme .header-left .back-button {
      color: var(--text-color) !important;
    }

    .dark-theme .header-left .back-button:hover {
      background: var(--highlight-bg) !important;
      color: var(--text-color) !important;
    }

    .dark-theme .header-actions button {
      color: var(--text-color) !important;
    }

    .dark-theme .header-actions button:hover {
      background: var(--highlight-bg) !important;
      color: var(--text-color) !important;
    }

    .dark-theme .loading-spinner {
      color: var(--primary-color) !important;
    }

    .dark-theme .footer-info i {
      color: var(--primary-color) !important;
    }

    /* 确保所有PrimeNG按钮图标在dark模式下正确显示 */
    .dark-theme .p-button-text {
      color: var(--text-color) !important;
    }

    .dark-theme .p-button-text:hover {
      background: var(--highlight-bg) !important;
      color: var(--text-color) !important;
    }

    .dark-theme .p-button-text:focus {
      box-shadow: 0 0 0 2px var(--focus-ring) !important;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .viewer-container {
        margin: 8px;
        width: calc(100% - 16px);
        height: calc(100% - 16px);
      }

      .viewer-header {
        padding: var(--spacing-3) var(--spacing-4);
        min-height: 70px;
      }

      .header-left {
        width: 50px;
      }

      .header-left .back-button {
        width: 36px;
        height: 36px;
        font-size: 1rem;
      }

      .header-center {
        margin: 0 var(--spacing-2);
      }

      .header-center h2 {
        max-width: 200px;
        font-size: var(--font-size-lg);
      }

      .header-actions {
        width: 80px;
      }

      .viewer-footer {
        padding: var(--spacing-2) var(--spacing-4);
        min-height: 60px;
      }

      .error-state {
        padding: var(--spacing-8) var(--spacing-4);
      }

      .error-icon {
        width: 80px;
        height: 80px;
      }

      .error-icon i {
        font-size: 2.5rem;
      }

      .error-state h3 {
        font-size: var(--font-size-xl);
      }

      .error-state p {
        font-size: var(--font-size-base);
      }

      .error-actions {
        flex-direction: column;
        width: 100%;
        max-width: 300px;
      }

      .error-actions button {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .header-center h2 {
        max-width: 120px;
        font-size: var(--font-size-base);
      }

      .loading-spinner {
        font-size: 2.5rem;
      }

      .loading-state span {
        font-size: var(--font-size-base);
      }

      .header-left {
        width: 40px;
      }

      .header-left .back-button {
        width: 32px;
        height: 32px;
        font-size: 0.9rem;
      }

      .header-actions {
        width: 60px;
      }
    }
  `]
})
export class HtmlViewerComponent implements OnInit {
  fileUrl: SafeResourceUrl | null = null;
  fileTitle: string | null = null;
  rawUrl: string | null = null;
  isLoading: boolean = true;

    constructor(    private route: ActivatedRoute,    private router: Router,    private htmlFileService: HtmlFileService,    private sanitizer: DomSanitizer,    private messageService: MessageService,    public i18n: I18nService  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const filename = params['filename'];
      if (filename) {
        this.loadHtmlFile(filename);
      } else {
        this.isLoading = false;
      }
    });
  }

  loadHtmlFile(filename: string): void {
    this.isLoading = true;
    const file = this.htmlFileService.getFile(filename);

    if (file) {
      // 确保使用正确的后端端口8080
      this.rawUrl = `http://localhost:8080/uploads/${file.filename}`;
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);
      this.fileTitle = file.title || file.filename;

      // 添加超时机制，确保页面不会一直loading
      setTimeout(() => {
        if (this.isLoading) {
          console.log('Force stop loading after timeout');
          this.isLoading = false;
        }
      }, 5000);
    } else {
      this.fileUrl = null;
      this.fileTitle = null;
      this.rawUrl = null;
      this.isLoading = false;
    }
  }

  onIframeLoaded(): void {
    this.isLoading = false;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  openInNewTab(): void {
    if (this.rawUrl) {
      window.open(this.rawUrl, '_blank');
    }
  }

  copyHtmlPath(): void {
    if (this.rawUrl) {
      navigator.clipboard.writeText(this.rawUrl).then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Copied',
          detail: 'HTML file path copied to clipboard',
          life: 3000
        });
      }).catch(err => {
        console.error('Failed to copy to clipboard: ', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Copy Failed',
          detail: 'Failed to copy file path, please copy manually',
          life: 3000
        });
      });
    }
  }

  reloadPage(): void {
    if (this.fileUrl) {
      this.isLoading = true;
      const iframe = document.querySelector('.html-frame') as HTMLIFrameElement;
      if (iframe) {
        iframe.src = iframe.src;
      }
    } else {
      window.location.reload();
    }
  }
}