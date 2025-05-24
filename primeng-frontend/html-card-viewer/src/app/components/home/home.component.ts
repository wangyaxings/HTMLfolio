import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HtmlFileService, HtmlFile, Category } from '../../services/html-file.service';
import { FileUploadModule, FileUpload } from 'primeng/fileupload';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DividerModule } from 'primeng/divider';

interface FileInfo {
  name: string;
  size: number;
  lastModified: number;
  type: string;
  file: File;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FileUploadModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ChipsModule,
    DialogModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    DividerModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="home-container">
      <!-- Hero Section with Upload -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">HTML File Manager</h1>
            <p class="hero-subtitle">Organize, preview, and manage your HTML files with style</p>
          </div>
          <div class="hero-upload">
            <div class="upload-area"
                 [class.drag-over]="isDragOver"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)"
                 (click)="triggerFileUpload()">
              <div class="upload-icon">
                <i class="pi pi-cloud-upload"></i>
              </div>
              <div class="upload-text">
                <h3>Drop HTML files here</h3>
                <p>or click to browse</p>
              </div>
              <input type="file"
                     #fileInput
                     multiple
                     accept=".html,.htm"
                     (change)="onFileSelect($event)"
                     style="display: none;">
            </div>
          </div>
        </div>
      </section>

      <!-- Files Grid -->
      <section class="files-section">
        <div class="section-header">
          <h2 class="section-title">{{ getSectionTitle() }}</h2>
          <div class="section-meta">
            <span class="file-count" *ngIf="displayedFiles.length > 0">
              {{ displayedFiles.length }} {{ displayedFiles.length === 1 ? 'file' : 'files' }}
            </span>
          </div>
        </div>

        <!-- Files Grid -->
        <div class="files-grid" *ngIf="displayedFiles.length > 0">
          <div class="file-card"
               *ngFor="let file of displayedFiles"
               (click)="navigateToDetails(file)"
               [attr.data-file-id]="file.id">
            <!-- Enhanced Thumbnail Preview -->
            <div class="file-thumbnail">
              <div class="thumbnail-content">
                <!-- Actual thumbnail with enhanced settings -->
                <iframe
                  [src]="getSafeFileUrl(file)"
                  class="thumbnail-frame"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  loading="lazy"
                  scrolling="no">
                </iframe>

                <!-- Enhanced overlay with more actions -->
                <div class="thumbnail-overlay">
                  <div class="overlay-actions">
                    <button pButton pRipple
                            type="button"
                            icon="fas fa-eye"
                            class="p-button-text overlay-btn"
                            pTooltip="预览文件"
                            (click)="viewHtml(file); $event.stopPropagation()">
                    </button>
                    <button pButton pRipple
                            type="button"
                            icon="fas fa-edit"
                            class="p-button-text overlay-btn"
                            pTooltip="编辑文件"
                            (click)="editFile(file); $event.stopPropagation()">
                    </button>
                  </div>
                </div>
              </div>

              <!-- File type and size badge -->
              <div class="file-type-badge">
                <i class="fas fa-file-code"></i>
                <span>HTML</span>
                <small *ngIf="file.fileSize">{{ formatFileSize(file.fileSize) }}</small>
              </div>
            </div>

            <!-- Enhanced File Info -->
            <div class="file-info">
              <!-- File Header with better organization -->
              <div class="file-header">
                <div class="title-section">
                  <h3 class="file-title" [title]="file.title || file.filename">
                    {{ file.title || file.filename }}
                  </h3>
                  <div class="file-subtitle" *ngIf="file.description">
                    {{ file.description | slice:0:80 }}{{ file.description && file.description.length > 80 ? '...' : '' }}
                  </div>
                </div>

                <!-- Quick actions menu -->
                <div class="quick-actions">
                  <button pButton pRipple
                          type="button"
                          icon="fas fa-ellipsis-h"
                          class="p-button-text p-button-sm action-menu-btn"
                          pTooltip="更多操作"
                          (click)="showFileActions(file, $event)">
                  </button>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="file-actions-section">
                <button pButton pRipple
                        type="button"
                        label="查看详情"
                        icon="fas fa-arrow-right"
                        class="p-button-primary details-btn"
                        (click)="navigateToDetails(file)">
                </button>

                <div class="secondary-actions">
                  <button pButton pRipple
                          type="button"
                          icon="fas fa-edit"
                          class="p-button-text p-button-sm"
                          pTooltip="编辑文件"
                          (click)="editFile(file); $event.stopPropagation()">
                  </button>
                  <button pButton pRipple
                          type="button"
                          icon="fas fa-info-circle"
                          class="p-button-text p-button-sm"
                          pTooltip="编辑信息"
                          (click)="editFileInfo(file); $event.stopPropagation()">
                  </button>
                  <button pButton pRipple
                          type="button"
                          icon="fas fa-history"
                          class="p-button-text p-button-sm"
                          pTooltip="查看历史"
                          (click)="viewHistory(file); $event.stopPropagation()"
                          *ngIf="file.hasHistory">
                  </button>
                  <button pButton pRipple
                          type="button"
                          icon="fas fa-trash"
                          class="p-button-text p-button-sm delete-btn"
                          pTooltip="删除文件"
                          (click)="confirmDelete(file); $event.stopPropagation()">
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="displayedFiles.length === 0">
          <div class="empty-icon">
            <i class="pi pi-inbox"></i>
          </div>
          <h3 class="empty-title">{{ getEmptyStateTitle() }}</h3>
          <p class="empty-message">{{ getEmptyStateMessage() }}</p>
          <button pButton pRipple
                  type="button"
                  label="Upload Files"
                  icon="pi pi-upload"
                  class="p-button-primary"
                  (click)="triggerFileUpload()">
          </button>
        </div>
      </section>

      <!-- Upload Details Dialog -->
      <p-dialog header="Upload HTML Files"
                [(visible)]="showUploadDialog"
                [modal]="true"
                [style]="{width: '800px'}"
                [closable]="true">
        <div class="upload-dialog-content">
          <!-- File Information Display -->
          <div class="file-list" *ngIf="fileInfos.length > 0">
            <h4>Selected Files ({{ fileInfos.length }})</h4>
            <div class="file-info-list">
              <div class="file-info-item" *ngFor="let fileInfo of fileInfos; let i = index">
                <div class="file-icon">
                  <i class="pi pi-file-o"></i>
                </div>
                <div class="file-details">
                  <div class="file-name">{{ fileInfo.name }}</div>
                  <div class="file-metadata">
                    <span class="file-size">{{ formatFileSize(fileInfo.size) }}</span>
                    <span class="file-modified">Modified: {{ formatDate(fileInfo.lastModified) }}</span>
                    <span class="file-type">{{ fileInfo.type || 'text/html' }}</span>
                  </div>
                </div>
                <div class="file-actions">
                  <button pButton pRipple
                          type="button"
                          icon="pi pi-eye"
                          class="p-button-text p-button-sm"
                          pTooltip="预览文件"
                          (click)="previewUploadFile(fileInfo)">
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="upload-form" *ngIf="fileInfos.length > 0">
            <h4>File Details</h4>
            <div class="form-grid">
              <div class="form-field">
                <label for="category">Category</label>
                <p-dropdown id="category"
                           [(ngModel)]="uploadForm.category"
                           [options]="categoryOptions"
                           optionLabel="label"
                           optionValue="value"
                           placeholder="Select category">
                </p-dropdown>
              </div>
              <div class="form-field">
                <label for="tags">Tags</label>
                <p-chips id="tags"
                        [(ngModel)]="uploadForm.tags"
                        placeholder="Add tags">
                </p-chips>
              </div>
              <div class="form-field full-width">
                <label for="description">Description</label>
                <input type="text"
                       id="description"
                       pInputText
                       [(ngModel)]="uploadForm.description"
                       placeholder="Enter description">
              </div>
            </div>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button pButton pRipple
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    class="p-button-text"
                    (click)="closeUploadDialog()">
            </button>
            <button pButton pRipple
                    type="button"
                    label="Upload"
                    icon="pi pi-upload"
                    class="p-button-primary"
                    [disabled]="fileInfos.length === 0"
                    (click)="uploadFiles()">
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Edit Dialog -->
      <p-dialog header="Edit File Details"
                [(visible)]="showEditDialog"
                [modal]="true"
                [style]="{width: '500px'}"
                [closable]="true">
        <div class="edit-form" *ngIf="editingFile">
          <div class="form-field">
            <label for="edit-title">Title</label>
            <input type="text"
                   id="edit-title"
                   pInputText
                   [(ngModel)]="editingFile.title"
                   placeholder="Enter title">
          </div>
          <div class="form-field">
            <label for="edit-category">Category</label>
            <p-dropdown id="edit-category"
                       [(ngModel)]="editingFile.category"
                       [options]="categoryOptions"
                       optionLabel="label"
                       optionValue="value"
                       placeholder="Select category">
            </p-dropdown>
          </div>
          <div class="form-field">
            <label for="edit-tags">Tags</label>
            <p-chips id="edit-tags"
                    [(ngModel)]="editingFile.tags"
                    placeholder="Add tags">
            </p-chips>
          </div>
          <div class="form-field">
            <label for="edit-description">Description</label>
            <input type="text"
                   id="edit-description"
                   pInputText
                   [(ngModel)]="editingFile.description"
                   placeholder="Enter description">
          </div>
        </div>

        <ng-template pTemplate="footer">
          <div class="dialog-footer">
            <button pButton pRipple
                    type="button"
                    label="Cancel"
                    icon="pi pi-times"
                    class="p-button-text"
                    (click)="showEditDialog = false">
            </button>
            <button pButton pRipple
                    type="button"
                    label="Save"
                    icon="pi pi-check"
                    class="p-button-primary"
                    (click)="saveFileChanges()">
            </button>
          </div>
        </ng-template>
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: var(--container-max-width);
      margin: 0 auto;
      padding: 0 var(--spacing-6);
    }

    /* Hero Section */
    .hero-section {
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--secondary-color) 100%);
      border-radius: var(--border-radius-xl);
      margin-bottom: var(--spacing-8);
      overflow: hidden;
      position: relative;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-8);
      padding: var(--spacing-12) var(--spacing-8);
      align-items: center;
    }

    .hero-text {
      color: white;
    }

    .hero-title {
      font-size: var(--font-size-4xl);
      font-weight: var(--font-weight-extrabold);
      margin: 0 0 var(--spacing-4);
      line-height: 1.1;
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      opacity: 0.9;
      margin: 0;
      line-height: 1.5;
    }

    .hero-upload {
      display: flex;
      justify-content: center;
    }

    .upload-area {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-8);
      text-align: center;
      cursor: pointer;
      transition: all var(--transition-duration) var(--transition-timing);
      width: 100%;
      max-width: 400px;
    }

    .upload-area:hover,
    .upload-area.drag-over {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.6);
      transform: translateY(-2px);
    }

    .upload-icon {
      margin-bottom: var(--spacing-4);
    }

    .upload-icon i {
      font-size: 3rem;
      color: white;
      opacity: 0.8;
    }

    .upload-text {
      color: white;
    }

    .upload-text h3 {
      margin: 0 0 var(--spacing-2);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .upload-text p {
      margin: 0;
      opacity: 0.8;
      font-size: var(--font-size-sm);
    }

    /* Section Titles */
    .section-title {
      font-size: var(--font-size-2xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-6);
      position: relative;
      padding-left: var(--spacing-4);
    }

    .section-title::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 4px;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: 2px;
    }

    /* Files Section */
    .files-section {
      margin-bottom: var(--spacing-8);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-6);
    }

    .section-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .file-count {
      background: var(--accent-cream);
      color: var(--text-color);
      padding: var(--spacing-2) var(--spacing-3);
      border-radius: var(--border-radius-full);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
    }

    /* Files Grid */
    .files-grid {
      display: grid;
      gap: var(--spacing-6);
    }

    .file-card {
      background: var(--surface-a);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-6);
      transition: all var(--transition-duration) var(--transition-timing);
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: var(--spacing-6);
      align-items: start;
    }

    .file-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-color);
    }

    /* File Thumbnail */
    .file-thumbnail {
      position: relative;
      width: 200px;
      height: 150px;
      border-radius: var(--border-radius);
      overflow: hidden;
      cursor: pointer;
      background: var(--surface-c);
      border: 1px solid var(--border-color);
    }

    .thumbnail-content {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .thumbnail-frame {
      width: 800px;
      height: 600px;
      border: none;
      background: white;
      transform: scale(0.25);
      transform-origin: top left;
      pointer-events: none;
      position: absolute;
      top: 0;
      left: 0;
      border-radius: 4px;
      opacity: 1;
      transition: opacity 0.3s ease;
    }

    .thumbnail-frame.loading {
      opacity: 0.5;
    }

    .thumbnail-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-c);
      color: var(--text-color-muted);
      font-size: var(--font-size-sm);
    }

    .thumbnail-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transition-duration) var(--transition-timing);
      z-index: 3;
    }

    .file-thumbnail:hover .thumbnail-overlay {
      opacity: 1;
    }

    .overlay-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    .overlay-btn {
      width: 2.5rem !important;
      height: 2.5rem !important;
      border-radius: var(--border-radius-full) !important;
      background: rgba(255, 255, 255, 0.9) !important;
      color: var(--text-color) !important;
      border: none !important;
      transition: all var(--transition-duration) !important;
    }

    .overlay-btn:hover {
      background: var(--primary-color) !important;
      color: white !important;
      transform: scale(1.1);
    }

    .file-type-badge {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: var(--spacing-1) var(--spacing-2);
      border-radius: var(--border-radius);
      font-size: var(--font-size-xs);
      font-weight: var(--font-weight-bold);
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    /* File Info */
    .file-info {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      min-width: 0;
    }

    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-3);
    }

    .title-section {
      flex: 1;
      min-width: 0;
    }

    .file-title {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-subtitle {
      font-size: var(--font-size-sm);
      color: var(--text-color-muted);
      line-height: 1.4;
    }

    .quick-actions {
      display: flex;
      gap: var(--spacing-1);
      flex-shrink: 0;
    }

    .action-menu-btn {
      width: 2rem !important;
      height: 2rem !important;
      border-radius: var(--border-radius-full) !important;
    }

    .file-actions-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--spacing-3);
      margin-top: auto;
    }

    .details-btn {
      flex: 1;
      max-width: 150px;
    }

    .secondary-actions {
      display: flex;
      gap: var(--spacing-1);
    }

    .delete-btn:hover {
      color: var(--danger-color) !important;
      background: var(--danger-color-light) !important;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-16) var(--spacing-4);
      background: var(--surface-a);
      border-radius: var(--border-radius-lg);
      border: 2px dashed var(--border-color);
    }

    .empty-icon {
      margin-bottom: var(--spacing-6);
    }

    .empty-icon i {
      font-size: 4rem;
      color: var(--text-color-muted);
    }

    .empty-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-3);
    }

    .empty-message {
      color: var(--text-color-secondary);
      margin: 0 0 var(--spacing-6);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
      line-height: 1.5;
    }

    /* Dialog Styles */
    .upload-dialog-content {
      padding: var(--spacing-4);
    }

    .file-list {
      margin-bottom: var(--spacing-6);
    }

    .file-list h4 {
      margin: 0 0 var(--spacing-4);
      color: var(--text-color);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .file-info-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-3);
      max-height: 300px;
      overflow-y: auto;
    }

    .file-info-item {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      padding: var(--spacing-3);
      background: var(--surface-b);
      border-radius: var(--border-radius);
      border: 1px solid var(--border-color);
    }

    .file-actions {
      display: flex;
      gap: var(--spacing-2);
      margin-left: auto;
    }

    .file-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary-color);
      color: white;
      border-radius: var(--border-radius);
    }

    .file-icon i {
      font-size: 1.2rem;
    }

    .file-details {
      flex: 1;
      min-width: 0;
    }

    .file-name {
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-metadata {
      display: flex;
      gap: var(--spacing-3);
      font-size: var(--font-size-sm);
      color: var(--text-color-muted);
      margin-top: var(--spacing-1);
    }

    .file-metadata span {
      white-space: nowrap;
    }

    .upload-form {
      border-top: 1px solid var(--border-color);
      padding-top: var(--spacing-6);
    }

    .upload-form h4 {
      margin: 0 0 var(--spacing-4);
      color: var(--text-color);
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-4);
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .form-field.full-width {
      grid-column: 1 / -1;
    }

    .form-field label {
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
      font-size: var(--font-size-sm);
    }

    .edit-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-3);
      margin-top: var(--spacing-6);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-6);
        text-align: center;
      }

      .file-card {
        grid-template-columns: 1fr;
        gap: var(--spacing-4);
      }

      .file-thumbnail {
        width: 100%;
        height: 200px;
        justify-self: center;
      }
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 0 var(--spacing-4);
      }

      .hero-content {
        padding: var(--spacing-8) var(--spacing-6);
      }

      .hero-title {
        font-size: var(--font-size-3xl);
      }

      .section-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-3);
      }

      .file-card {
        padding: var(--spacing-4);
      }

      .file-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-2);
      }

      .form-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 480px) {
      .hero-title {
        font-size: var(--font-size-2xl);
      }

      .upload-area {
        padding: var(--spacing-6);
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  files: HtmlFile[] = [];
  displayedFiles: HtmlFile[] = [];
  categories: Category[] = [];
  selectedCategory: string = 'all';
  searchQuery: string = '';
  popularTags: string[] = [];
  selectedTag: string = '';
  isDragOver: boolean = false;
  fileInfos: FileInfo[] = [];

  showUploadDialog: boolean = false;
  showEditDialog: boolean = false;
  showCategoryManagement: boolean = false;
  editingFile: HtmlFile | null = null;

  uploadForm = {
    category: 'other',
    tags: [] as string[],
    description: ''
  };

  newCategory = {
    name: '',
    icon: 'pi-folder',
    color: '#6B7280'
  };

  categoryOptions: any[] = [];

  @ViewChild('fileInput') fileInput!: any;

  constructor(
    private htmlFileService: HtmlFileService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupCategoryOptions();
  }

  private loadData(): void {
    this.files = this.htmlFileService.getFiles();
    this.categories = this.htmlFileService.getCategories();
    this.filterFiles();
    this.updatePopularTags();
  }

  private setupCategoryOptions(): void {
    this.categoryOptions = this.htmlFileService.getCategories().map(cat => ({
      label: cat.name,
      value: cat.id
    }));
  }

  private updatePopularTags(): void {
    const allTags = this.files.flatMap(file => file.tags || []);
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.popularTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 15)
      .map(([tag]) => tag);
  }

  get totalFiles(): number {
    return this.files.length;
  }

  get topCategories(): Category[] {
    const categoriesWithCounts = this.categories
      .map(cat => ({
        ...cat,
        count: this.getCategoryCount(cat.id)
      }))
      .filter(cat => cat.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    return categoriesWithCounts;
  }

  getCategoryCount(categoryId: string): number {
    return this.files.filter(file => file.category === categoryId).length;
  }

  getTagCount(tag: string): number {
    return this.files.filter(file => file.tags?.includes(tag)).length;
  }

  getCategoryName(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Other';
  }

  getCategoryIcon(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.icon || 'pi-file';
  }

  getCategoryColor(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.color || '#6B7280';
  }

  getFileUrl(file: HtmlFile): string {
    return `http://localhost:8080/uploads/${file.filename}`;
  }

  getSafeFileUrl(file: HtmlFile): SafeResourceUrl {
    const url = this.getFileUrl(file);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.selectedTag = '';
    this.filterFiles();
  }

  filterFiles(): void {
    let filtered = this.files;

    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(file => file.category === this.selectedCategory);
    }

    if (this.selectedTag) {
      filtered = filtered.filter(file => file.tags?.includes(this.selectedTag));
    }

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(file =>
        file.filename.toLowerCase().includes(query) ||
        (file.title && file.title.toLowerCase().includes(query)) ||
        (file.description && file.description.toLowerCase().includes(query)) ||
        (file.tags && file.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }

    this.displayedFiles = filtered;
  }

  filterByTag(tag: string): void {
    this.selectedTag = this.selectedTag === tag ? '' : tag;
    this.selectedCategory = 'all';
    this.searchQuery = '';
    this.filterFiles();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedTag = '';
    this.filterFiles();
  }

  getSectionTitle(): string {
    if (this.searchQuery) {
      return `Search Results for "${this.searchQuery}"`;
    }
    if (this.selectedTag) {
      return `Files tagged with "${this.selectedTag}"`;
    }
    if (this.selectedCategory === 'all') {
      return 'All Files';
    }
    return this.getCategoryName(this.selectedCategory);
  }

  getEmptyStateTitle(): string {
    if (this.searchQuery) {
      return 'No files found';
    }
    if (this.selectedCategory !== 'all') {
      return 'No files in this category';
    }
    return 'No HTML files uploaded yet';
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery) {
      return 'Try adjusting your search terms or browse all files.';
    }
    if (this.selectedCategory !== 'all') {
      return 'Upload some HTML files to this category to get started.';
    }
    return 'Upload your first HTML file to begin organizing your collection.';
  }

  onFileSelect(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.fileInfos = Array.from(files as FileList).map((file: File) => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type,
        file: file
      }));
      this.showUploadDialog = true;
      event.target.value = '';
    }
  }

  uploadFiles(): void {
    const files = this.fileInfos.map(info => info.file);

    if (!files || files.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Files',
        detail: 'Please select files to upload.'
      });
      return;
    }

    let uploadCount = 0;
    const totalFiles = files.length;

    for (const file of files) {
      this.htmlFileService.uploadFile(
        file,
        this.uploadForm.category,
        this.uploadForm.tags,
        this.uploadForm.description
      ).subscribe({
        next: (response) => {
          uploadCount++;

          if (uploadCount === totalFiles) {
            this.messageService.add({
              severity: 'success',
              summary: 'Upload Successful',
              detail: `${totalFiles} file(s) uploaded successfully.`
            });

            this.loadData();
            this.closeUploadDialog();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: `Failed to upload ${file.name}: ${error.message}`
          });
        }
      });
    }
  }

  private resetUploadForm(): void {
    this.uploadForm = {
      category: 'other',
      tags: [],
      description: ''
    };
  }

  editFile(file: HtmlFile): void {
    // 跳转到编辑页面
    this.router.navigate(['/edit', file.filename]);
  }

  editFileInfo(file: HtmlFile): void {
    // 编辑文件信息（弹出对话框）
    this.editingFile = { ...file };
    this.showEditDialog = true;
  }

  saveFileChanges(): void {
    if (this.editingFile) {
      const success = this.htmlFileService.updateFile(this.editingFile.filename, this.editingFile);
      if (success) {
        this.messageService.add({
          severity: 'success',
          summary: 'Updated',
          detail: 'File details updated successfully.'
        });
        this.loadData();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update file details.'
        });
      }
      this.showEditDialog = false;
      this.editingFile = null;
    }
  }

  viewHtml(file: HtmlFile): void {
    this.router.navigate(['/view', file.filename]);
  }

  confirmDelete(file: HtmlFile): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${file.title || file.filename}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteHtml(file);
      }
    });
  }

  deleteHtml(file: HtmlFile): void {
    this.htmlFileService.deleteFile(file.filename);
    this.messageService.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `${file.title || file.filename} has been deleted.`
    });
    this.loadData();
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    const files = event.dataTransfer?.files;
    if (files) {
      this.fileInfos = Array.from(files as FileList).map((file: File) => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        type: file.type,
        file: file
      }));
      this.showUploadDialog = true;
    }
  }

  triggerFileUpload(): void {
    this.fileInput.nativeElement.click();
  }

  closeUploadDialog(): void {
    this.showUploadDialog = false;
    this.fileInfos = [];
    this.resetUploadForm();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  // UI/UX improvement methods
  navigateToDetails(file: HtmlFile): void {
    this.router.navigate(['/view', file.filename]);
  }

  previewUploadFile(fileInfo: FileInfo): void {
    // 预览上传的HTML文件
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const blob = new Blob([content], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'width=800,height=600');
      // 清理URL避免内存泄漏
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    reader.readAsText(fileInfo.file);
  }

  showFileActions(file: HtmlFile, event: Event): void {
    event.stopPropagation();
    // 显示文件操作菜单（可以实现为下拉菜单）
    console.log('Show file actions for:', file.filename);
  }

  viewHistory(file: HtmlFile): void {
    // 查看文件历史版本
    console.log('View history for:', file.filename);
    this.messageService.add({
      severity: 'info',
      summary: '历史记录',
      detail: '历史记录功能正在开发中...'
    });
  }
}