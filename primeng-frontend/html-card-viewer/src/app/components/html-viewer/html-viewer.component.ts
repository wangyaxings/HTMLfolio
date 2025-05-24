import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HtmlFileService } from '../../services/html-file.service';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-html-viewer',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  template: `
    <div class="viewer-wrapper">
      <div class="viewer-container">
        <!-- Viewer Header Toolbar -->
        <div class="viewer-header">
          <div class="header-left">
            <button pButton pRipple
                    icon="pi pi-arrow-left"
                    label="Back"
                    class="p-button-outlined p-button-secondary"
                    (click)="goBack()"></button>
            <h2 *ngIf="fileTitle">{{ fileTitle }}</h2>
          </div>

          <div class="header-actions" *ngIf="fileUrl">
            <button pButton pRipple
                    icon="pi pi-copy"
                    pTooltip="Copy HTML Path"
                    tooltipPosition="bottom"
                    class="p-button-text p-button-secondary"
                    (click)="copyHtmlPath()"></button>
            <button pButton pRipple
                    icon="pi pi-external-link"
                    pTooltip="Open in New Tab"
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
            <span>Loading HTML content...</span>
          </div>

          <!-- HTML Content Preview -->
          <iframe *ngIf="fileUrl && !isLoading"
                 [src]="fileUrl"
                 class="html-frame"
                 (load)="onIframeLoaded()"></iframe>

          <!-- Error State -->
          <div *ngIf="!fileUrl && !isLoading" class="error-state">
            <div class="error-icon">
              <i class="pi pi-exclamation-circle"></i>
            </div>
            <h3>HTML File Not Found</h3>
            <p>Please check if the file exists or return to the home page</p>
            <div class="error-actions">
              <button pButton pRipple
                      label="Go Home"
                      icon="pi pi-home"
                      class="p-button-primary"
                      (click)="goHome()"></button>
              <button pButton pRipple
                      label="Refresh"
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
          <div class="footer-actions">
            <button pButton pRipple
                    label="Go Home"
                    icon="pi pi-home"
                    class="p-button-text p-button-sm"
                    (click)="goHome()"></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .viewer-wrapper {
      padding: 0;
    }

    .viewer-container {
      background-color: var(--surface-card);
      border-radius: var(--card-border-radius);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: calc(100vh - var(--header-height) - var(--footer-height) - var(--spacing-8));
      min-height: 500px;
    }

    /* Viewer Header */
    .viewer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--border-color);
      background-color: var(--surface-a);
    }

    .header-left {
      display: flex;
      align-items: center;
    }

    .header-left h2 {
      margin: 0 0 0 var(--spacing-3);
      padding: 0;
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    /* Viewer Content */
    .viewer-content {
      flex: 1;
      overflow: hidden;
      position: relative;
      background-color: var(--surface-b);
    }

    .html-frame {
      width: 100%;
      height: 100%;
      border: none;
      background-color: white;
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
      background-color: var(--surface-b);
      z-index: 5;
    }

    .loading-spinner {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-3);
    }

    .loading-state span {
      color: var(--text-secondary-color);
      font-size: var(--font-size-base);
    }

    /* Error State */
    .error-state {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: var(--spacing-8) var(--spacing-4);
      background-color: var(--surface-b);
    }

    .error-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background-color: #fff3f3;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: var(--spacing-4);
    }

    .error-icon i {
      font-size: 2.5rem;
      color: var(--danger-color);
    }

    .error-state h3 {
      font-size: var(--font-size-xl);
      color: var(--text-color);
      margin: 0 0 var(--spacing-2);
      font-weight: var(--font-weight-medium);
    }

    .error-state p {
      color: var(--text-secondary-color);
      margin: 0 0 var(--spacing-6);
    }

    .error-actions {
      display: flex;
      gap: var(--spacing-3);
    }

    /* Viewer Footer */
    .viewer-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--spacing-2) var(--spacing-4);
      background-color: var(--surface-c);
      border-top: 1px solid var(--border-color);
      font-size: var(--font-size-sm);
      color: var(--text-muted);
    }

    .footer-info {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .file-path {
      font-family: var(--font-family-code);
      font-size: var(--font-size-xs);
    }

    /* Responsive Adaptation */
    @media (max-width: 768px) {
      .viewer-container {
        height: calc(100vh - var(--header-height) - var(--footer-height) - var(--spacing-4));
      }

      .header-left h2 {
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .error-actions {
        flex-direction: column;
        gap: var(--spacing-2);
      }

      .viewer-footer {
        flex-direction: column;
        gap: var(--spacing-2);
        align-items: flex-start;
      }

      .file-path {
        max-width: 250px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  `]
})
export class HtmlViewerComponent implements OnInit {
  fileUrl: SafeResourceUrl | null = null;
  fileTitle: string | null = null;
  rawUrl: string | null = null;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private htmlFileService: HtmlFileService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) {}

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
      // Build file URL and use DomSanitizer for security processing
      this.rawUrl = `http://localhost:8080${file.path}`;
      this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawUrl);
      this.fileTitle = file.title || file.filename;
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