import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HtmlFileService, HtmlFile, Category } from '../../services/html-file.service';
import { I18nService } from '../../services/i18n.service';
import { FileUploadModule } from 'primeng/fileupload';
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
import { MultiSelectModule } from 'primeng/multiselect';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

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
    DividerModule,
    MultiSelectModule,
    IconFieldModule,
    InputIconModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="home-container">
      <!-- Hero Section with Search -->
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              <i class="fa-solid fa-file-arrow-up hero-icon"></i>
              {{ i18n.t('heroTitle') }}
            </h1>
            <p class="hero-subtitle">
              <i class="fa-solid fa-wand-magic-sparkles"></i>
              {{ i18n.t('heroSubtitle') }}
            </p>
          </div>

          <!-- Enhanced Search Bar -->
          <div class="search-section">
            <div class="search-bar">
              <p-iconField iconPosition="left" styleClass="w-full">
                <p-inputIcon styleClass="pi pi-search"></p-inputIcon>
                <input
                  pInputText
                  type="text"
                  [(ngModel)]="searchQuery"
                  [placeholder]="i18n.t('searchPlaceholder')"
                  (input)="onSearchChange()"
                  class="search-input w-full">
              </p-iconField>

              <!-- Filter Button -->
              <button pButton pRipple
                      type="button"
                      icon="fa-solid fa-filter"
                      class="filter-toggle-btn"
                      [class.active]="showFilters"
                      [pTooltip]="i18n.t('filters')"
                      (click)="toggleFilters()">
              </button>
            </div>

            <!-- Trending Searches -->
            <div class="trending-section" *ngIf="trendingSearches.length > 0">
              <span class="trending-label">
                <i class="fa-solid fa-arrow-trend-up"></i>
                {{ i18n.t('trendingSearches') }}
              </span>
              <div class="trending-tags">
                <p-tag
                  *ngFor="let search of trendingSearches"
                  [value]="search"
                  icon="fa-solid fa-tag"
                  styleClass="trending-tag"
                  (click)="setSearchQuery(search)">
                </p-tag>
              </div>
            </div>
          </div>

          <!-- Filters Panel -->
          <div class="filters-panel" [class.expanded]="showFilters">
            <div class="filters-row" *ngIf="showFilters">
              <!-- Category Filter -->
              <div class="filter-group">
                <label class="filter-label">
                  <i class="fa-solid fa-sitemap"></i>
                  {{ i18n.t('category') }}
                </label>
                <p-dropdown
                  [options]="categoryFilterOptions"
                  [(ngModel)]="selectedCategoryFilter"
                  optionLabel="label"
                  optionValue="value"
                  [placeholder]="i18n.t('allCategories')"
                  (onChange)="onCategoryFilterChange()"
                  appendTo="body"
                  styleClass="category-filter">
                </p-dropdown>
              </div>

              <!-- Tags Filter -->
              <div class="filter-group">
                <label class="filter-label">
                  <i class="fa-solid fa-tags"></i>
                  {{ i18n.t('tags') }}
                </label>
                <p-multiSelect
                  [options]="tagFilterOptions"
                  [(ngModel)]="selectedTagsFilter"
                  optionLabel="label"
                  optionValue="value"
                  [placeholder]="i18n.t('allTags')"
                  (onChange)="onTagsFilterChange()"
                  appendTo="body"
                  styleClass="tags-filter"
                  [maxSelectedLabels]="2">
                </p-multiSelect>
              </div>

              <!-- Clear Filters -->
              <div class="filter-actions">
                <button pButton pRipple
                        type="button"
                        label="Clear"
                        icon="fa-solid fa-circle-xmark"
                        class="p-button-text clear-filters-btn"
                        (click)="clearAllFilters()"
                        *ngIf="hasActiveFilters()">
                </button>
              </div>
            </div>
          </div>

          <!-- Upload Area -->
          <div class="hero-upload">
            <div class="upload-area"
                 [class.drag-over]="isDragOver"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)"
                 (click)="triggerFileUpload()">
              <div class="upload-icon">
                <i class="fa-solid fa-cloud-arrow-up"></i>
              </div>
              <div class="upload-text">
                <h3>
                  <i class="fa-solid fa-file-circle-plus"></i>
                  {{ i18n.t('dropFiles') }}
                </h3>
                <p>
                  <i class="fa-solid fa-computer-mouse"></i>
                  {{ i18n.t('clickToBrowse') }}
                </p>
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
          <h2 class="section-title">
            <i class="fa-solid fa-folder-open"></i>
            {{ getSectionTitle() }}
          </h2>
          <div class="section-meta">
            <span class="file-count-badge" *ngIf="displayedFiles.length > 0">
              <i class="fa-solid fa-file-lines"></i>
              {{ displayedFiles.length }} {{ i18n.plural(displayedFiles.length, i18n.t('file'), i18n.t('files')) }}
            </span>
          </div>
        </div>

        <!-- Enhanced Files Grid -->
        <div class="files-grid" *ngIf="displayedFiles.length > 0">
          <div class="file-card"
               *ngFor="let file of displayedFiles"
               (click)="navigateToDetails(file)"
               [attr.data-file-id]="file.id">

            <!-- Fixed Size Thumbnail with Zoomed Out View -->
            <div class="file-thumbnail">
              <div class="thumbnail-content">
                <iframe
                  [src]="getSafeFileUrl(file)"
                  class="thumbnail-frame"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                  loading="lazy"
                  scrolling="no">
                </iframe>

                <!-- Hover Actions -->
                <div class="thumbnail-overlay">
                  <div class="overlay-actions">
                    <button pButton pRipple
                            type="button"
                            icon="fa-solid fa-eye"
                            class="p-button-rounded p-button-text overlay-btn"
                            [pTooltip]="i18n.t('preview')"
                            (click)="viewHtml(file); $event.stopPropagation()">
                    </button>
                    <button pButton pRipple
                            type="button"
                            icon="fa-solid fa-pencil"
                            class="p-button-rounded p-button-text overlay-btn"
                            [pTooltip]="i18n.t('edit')"
                            (click)="editFile(file); $event.stopPropagation()">
                    </button>
                    <button pButton pRipple
                            type="button"
                            icon="fa-solid fa-trash"
                            class="p-button-rounded p-button-text overlay-btn p-button-danger"
                            [pTooltip]="i18n.t('delete')"
                            (click)="confirmDelete(file); $event.stopPropagation()">
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Fixed Height File Info -->
            <div class="file-info">
              <div class="file-header">
                <h3 class="file-title" [title]="file.title || file.filename">
                  <i class="fa-solid fa-file-export"></i>
                  {{ (file.title || file.filename) | slice:0:35 }}{{ (file.title || file.filename).length && (file.title || file.filename)!.length > 35 ? '...' : '' }}
                </h3>
                <div class="file-meta">
                  <p-tag
                    *ngIf="file.category"
                    [value]="getCategoryName(file.category)"
                    [icon]="getCategoryIconFA(file.category)"
                    [style.background-color]="getCategoryColor(file.category)"
                    styleClass="category-tag">
                  </p-tag>
                </div>
              </div>

              <!-- Compact Two-Row Tags Container -->
              <div class="file-tags-container">
                <div class="file-tags" *ngIf="file.tags && file.tags.length > 0">
                  <p-tag
                    *ngFor="let tag of file.tags.slice(0, 6)"
                    [value]="tag"
                    icon="fa-solid fa-tag"
                    severity="secondary"
                    styleClass="file-tag"
                    (click)="filterByTag(tag); $event.stopPropagation()">
                  </p-tag>
                  <span *ngIf="file.tags.length > 6" class="more-tags">
                    <i class="fa-solid fa-plus"></i>
                    {{ file.tags.length - 6 }}
                  </span>
                </div>
                <div class="no-tags" *ngIf="!file.tags || file.tags.length === 0">
                  <span class="no-tags-text">
                    <i class="fa-solid fa-circle-minus"></i>
                    No tags
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="file-actions">
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="displayedFiles.length === 0">
          <div class="empty-icon">
            <i class="fa-solid fa-inbox"></i>
          </div>
          <h3 class="empty-title">{{ getEmptyStateTitle() }}</h3>
          <p class="empty-message">{{ getEmptyStateMessage() }}</p>
          <button pButton pRipple
                  type="button"
                  [label]="i18n.t('uploadFiles')"
                  icon="fa-solid fa-upload"
                  class="upload-cta-btn"
                  (click)="triggerFileUpload()"
                  *ngIf="files.length === 0">
          </button>
        </div>
      </section>

      <!-- Upload Dialog -->
      <p-dialog
        [header]="i18n.t('uploadFiles')"
        [(visible)]="showUploadDialog"
        [style]="{width: '50vw'}"
        [modal]="true"
        styleClass="upload-dialog">

        <div class="upload-form">
          <div class="field">
            <label for="title" class="field-label">{{ i18n.t('title') }}</label>
            <input pInputText
                   id="title"
                   [(ngModel)]="uploadForm.title"
                   class="w-full" />
          </div>

          <div class="field">
            <label for="description" class="field-label">{{ i18n.t('description') }}</label>
            <textarea pInputTextarea
                      id="description"
                      [(ngModel)]="uploadForm.description"
                      rows="3"
                      class="w-full"></textarea>
          </div>

          <div class="field">
            <label for="category" class="field-label">{{ i18n.t('category') }}</label>
            <p-dropdown
              [options]="categoryOptions"
              [(ngModel)]="uploadForm.category"
              optionLabel="label"
              optionValue="value"
              [placeholder]="i18n.t('selectCategory')"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="field">
            <label for="tags" class="field-label">{{ i18n.t('tags') }}</label>
            <p-chips
              [(ngModel)]="uploadForm.tags"
              [placeholder]="i18n.t('addTags')"
              class="w-full">
            </p-chips>
          </div>
        </div>

        <ng-template pTemplate="footer">
          <button pButton pRipple
                  type="button"
                  [label]="i18n.t('cancel')"
                  icon="fa-solid fa-xmark"
                  class="p-button-text"
                  (click)="closeUploadDialog()">
          </button>
          <button pButton pRipple
                  type="button"
                  [label]="i18n.t('upload')"
                  icon="fa-solid fa-upload"
                  class="p-button-primary"
                  (click)="uploadFiles()"
                  [disabled]="fileInfos.length === 0">
          </button>
        </ng-template>
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog
        [header]="i18n.t('deleteConfirm')"
        [acceptLabel]="i18n.t('confirmDelete')"
        [rejectLabel]="i18n.t('cancel')"
        acceptIcon="fa-solid fa-check"
        rejectIcon="fa-solid fa-xmark">
      </p-confirmDialog>

    </div>
  `,
  styles: [`
    /* CSS Variables and Base Layout */
    :host {
      --spacing-1: 0.25rem;
      --spacing-2: 0.5rem;
      --spacing-3: 0.75rem;
      --spacing-4: 1rem;
      --spacing-5: 1.25rem;
      --spacing-6: 1.5rem;
      --spacing-8: 2rem;
      --spacing-10: 2.5rem;
      --spacing-12: 3rem;

      --font-size-xs: 0.75rem;
      --font-size-sm: 0.875rem;
      --font-size-base: 1rem;
      --font-size-lg: 1.125rem;
      --font-size-xl: 1.25rem;
      --font-size-2xl: 1.5rem;
      --font-size-3xl: 1.875rem;

      --font-weight-normal: 400;
      --font-weight-medium: 500;
      --font-weight-semibold: 600;
      --font-weight-bold: 700;

      --border-radius-sm: 0.375rem;
      --border-radius-md: 0.5rem;
      --border-radius-lg: 0.75rem;
      --border-radius-xl: 1rem;

      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    }

    .home-container {
      padding: 0 var(--spacing-6);
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Hero Section */
    .hero-section {
      padding: var(--spacing-8) 0 var(--spacing-12) 0;
      background: linear-gradient(135deg, var(--surface-a) 0%, var(--surface-b) 100%);
      border-radius: var(--border-radius-xl);
      margin-bottom: var(--spacing-8);
    }

    .hero-content {
      max-width: 1000px;
      margin: 0 auto;
      text-align: center;
    }

    .hero-text {
      margin-bottom: var(--spacing-8);
    }

    .hero-title {
      font-size: var(--font-size-3xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-4) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-3);
    }

    .hero-subtitle {
      font-size: var(--font-size-lg);
      color: var(--text-color-secondary);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Enhanced Search Section */
    .search-section {
      max-width: 800px;
      margin: 0 auto var(--spacing-6) auto;
    }

    .search-bar {
      display: flex;
      gap: var(--spacing-3);
      margin-bottom: var(--spacing-4);
    }

    .search-input {
      height: 48px !important;
      font-size: var(--font-size-base) !important;
      border-radius: var(--border-radius-lg) !important;
      padding: 0 var(--spacing-4) 0 var(--spacing-10) !important;
    }

    .filter-toggle-btn {
      height: 48px !important;
      width: 48px !important;
      border-radius: var(--border-radius-lg) !important;
      background: var(--surface-b) !important;
      border: 1px solid var(--border-color) !important;
      transition: all 0.2s ease !important;
    }

    .filter-toggle-btn.active {
      background: var(--primary-color) !important;
      border-color: var(--primary-color) !important;
      color: white !important;
    }

    .trending-section {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
      flex-wrap: wrap;
      justify-content: center;
    }

    .trending-label {
      font-size: var(--font-size-sm);
      color: var(--text-color-muted);
      font-weight: var(--font-weight-medium);
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .trending-label i {
      color: var(--orange-500);
      animation: flash 2s infinite;
    }

    @keyframes flash {
      0%, 50%, 100% { opacity: 1; }
      25%, 75% { opacity: 0.5; }
    }

    .trending-tags {
      display: flex;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .trending-tag {
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .trending-tag:hover {
      transform: scale(1.05);
    }

    /* Filters Panel */
    .filters-panel {
      background: var(--surface-a);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 0;
      margin-bottom: var(--spacing-6);
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease;
      position: relative;
      z-index: 1000;
    }

    .filters-panel.expanded {
      max-height: 200px;
      padding: var(--spacing-4);
      overflow: visible;
    }

    .filters-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: var(--spacing-4);
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .filter-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .filter-label i {
      color: var(--primary-color);
    }

    /* Upload Area */
    .hero-upload {
      max-width: 600px;
      margin: 0 auto;
    }

    .upload-area {
      border: 2px dashed var(--border-color);
      border-radius: var(--border-radius-xl);
      padding: var(--spacing-8);
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: var(--surface-a);
    }

    .upload-area:hover,
    .upload-area.drag-over {
      border-color: var(--primary-color);
      background: var(--primary-color-light);
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-4);
    }

    .upload-text h3 {
      font-size: var(--font-size-lg);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-2) 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
    }

    .upload-text p {
      color: var(--text-color-muted);
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-2);
    }

    /* Files Grid - Fixed Size Design */
    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--spacing-4);
      margin-bottom: var(--spacing-8);
    }

    .file-card {
      background: var(--surface-a);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      height: 300px;
      display: flex;
      flex-direction: column;
    }

    .file-card:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
      transform: translateY(-2px);
    }

    /* Fixed Size Thumbnail with Zoomed Out View */
    .file-thumbnail {
      position: relative;
      height: 180px;
      overflow: hidden;
      flex-shrink: 0;
    }

    .thumbnail-content {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .thumbnail-frame {
      width: 300%;
      height: 300%;
      border: none;
      background: var(--surface-b);
      transform: scale(0.33);
      transform-origin: top left;
      pointer-events: none;
      overflow: hidden;
    }

    .thumbnail-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .file-card:hover .thumbnail-overlay {
      opacity: 1;
    }

    .overlay-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    .overlay-btn {
      background: rgba(0, 0, 0, 0.6) !important;
      border-radius: var(--border-radius-md) !important;
    }

    /* Fixed Height File Info */
    .file-info {
      padding: var(--spacing-3);
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .file-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--spacing-2);
    }

    .file-title {
      font-size: var(--font-size-base);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0;
      line-height: 1.3;
      flex: 1;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .hero-icon {
      margin-right: var(--spacing-2);
      color: var(--primary-color);
    }

    .file-meta {
      margin-left: var(--spacing-2);
    }

    .category-tag {
      font-size: var(--font-size-xs) !important;
      padding: 0.25rem 0.5rem !important;
      color: var(--surface-a) !important;
    }

    .file-tags-container {
      height: 40px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      margin-bottom: var(--spacing-2);
      overflow: hidden;
    }

    .file-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 2px;
      line-height: 1.2;
      align-content: flex-start;
    }

    .file-tag {
      font-size: var(--font-size-xs) !important;
      padding: 0.1rem 0.3rem !important;
      cursor: pointer;
      transition: all 0.2s ease;
      height: 16px;
      line-height: 1;
    }

    .file-tag:hover {
      transform: scale(1.05);
    }

    .more-tags {
      font-size: var(--font-size-xs);
      color: var(--text-color-muted);
      align-self: center;
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
    }

    .no-tags {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .no-tags-text {
      font-size: 11px;
      color: var(--text-color-secondary);
      display: flex;
      align-items: center;
      gap: 4px;
      line-height: 1;
    }

    /* Actions */
    .file-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .view-btn {
      height: 32px !important;
      width: 32px !important;
      background: var(--primary-color) !important;
      border: none !important;
    }

    .more-btn {
      height: 32px !important;
      width: 32px !important;
    }

    /* Section Header */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-6);
    }

    .section-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-bold);
      color: var(--text-color);
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .file-count-badge {
      font-size: var(--font-size-sm);
      color: var(--primary-color);
      background: var(--surface-c);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--border-radius-lg);
      font-weight: var(--font-weight-semibold);
      border: 1px solid var(--surface-d);
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .file-count-badge:hover {
      background: var(--surface-d);
      border-color: var(--primary-color-light);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-12) var(--spacing-4);
    }

    .empty-icon {
      font-size: 4rem;
      color: var(--text-color-muted);
      margin-bottom: var(--spacing-4);
    }

    .empty-title {
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin: 0 0 var(--spacing-2) 0;
    }

    .empty-message {
      color: var(--text-color-muted);
      margin: 0 0 var(--spacing-6) 0;
    }

    /* Upload Dialog */
    .upload-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .field-label {
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    /* 下拉框层级控制 */
    :host ::ng-deep .p-dropdown-panel,
    :host ::ng-deep .p-multiselect-panel {
      z-index: 9999 !important;
    }

    /* 图标样式增强 */
    .hero-title i,
    .hero-subtitle i,
    .section-title i,
    .filter-label i,
    .upload-text i,
    .empty-icon i,
    .file-title i,
    .more-tags i,
    .no-tags-text i {
      color: #5E7C7A;
    }

    .trending-label i {
      color: #AF8B5F;
      animation: flash 1.5s infinite;
    }

    .filter-toggle-btn.active i,
    .view-btn i {
      color: white !important;
    }

    .overlay-btn i {
      color: #FFFFFF !important;
    }

    .hero-icon {
      font-size: 1.2em;
    }

    .category-tag i {
      color: var(--surface-a) !important;
      font-size: 0.9em;
      margin-right: var(--spacing-1);
    }





    /* Responsive Design */
    @media (max-width: 768px) {
      .home-container {
        padding: 0 var(--spacing-4);
      }

      .files-grid {
        grid-template-columns: 1fr;
        gap: var(--spacing-3);
      }

      .file-card {
        height: 380px;
      }

      .filters-row {
        grid-template-columns: 1fr;
        gap: var(--spacing-3);
      }

      .search-bar {
        flex-direction: column;
      }

      .trending-section {
        justify-content: flex-start;
      }

      .hero-title {
        font-size: 2rem;
      }

      .file-thumbnail {
        height: 160px;
      }

      .file-tags-container {
        height: 32px;
      }
    }

    @media (max-width: 480px) {
      .file-card {
        height: 360px;
      }

      .file-thumbnail {
        height: 140px;
      }

      .file-info {
        padding: var(--spacing-2);
      }

      .upload-area {
        padding: var(--spacing-4);
      }

      .file-tags-container {
        height: 30px;
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

  // New search and filter properties
  showFilters: boolean = false;
  trendingSearches: string[] = [];
  selectedCategoryFilter: string = '';
  selectedTagsFilter: string[] = [];
  categoryFilterOptions: any[] = [];
  tagFilterOptions: any[] = [];

  showUploadDialog: boolean = false;
  showEditDialog: boolean = false;
  showCategoryManagement: boolean = false;
  editingFile: HtmlFile | null = null;

  uploadForm = {
    title: '',
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
    private sanitizer: DomSanitizer,
    public i18n: I18nService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.setupFilterOptions();
  }

  private loadData(): void {
    this.files = this.htmlFileService.getFiles();
    this.categories = this.htmlFileService.getCategories();
    this.setupCategoryOptions();
    this.updatePopularTags();
    this.filterFiles();
  }

  private setupCategoryOptions(): void {
    this.categoryOptions = this.categories.map(cat => ({
      label: cat.name,
      value: cat.id
    }));
  }

  private updatePopularTags(): void {
    const tagCounts = new Map<string, number>();
    this.files.forEach(file => {
      file.tags?.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    this.popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag]) => tag);

    // Generate trending searches based on real data
    this.generateTrendingSearches();
  }

  private generateTrendingSearches(): void {
    const searchTerms: { [key: string]: number } = {};

    // Collect search terms from file titles, descriptions, and tags
    this.files.forEach(file => {
      // Process file title
      if (file.title) {
        const titleWords = file.title.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        titleWords.forEach(word => {
          searchTerms[word] = (searchTerms[word] || 0) + 1;
        });
      }

      // Process file description
      if (file.description) {
        const descWords = file.description.toLowerCase().split(/\s+/).filter(word => word.length > 3);
        descWords.forEach(word => {
          searchTerms[word] = (searchTerms[word] || 0) + 1;
        });
      }

      // Process tags (with higher weight)
      if (file.tags) {
        file.tags.forEach(tag => {
          searchTerms[tag.toLowerCase()] = (searchTerms[tag.toLowerCase()] || 0) + 2;
        });
      }

      // Process category names
      if (file.category) {
        const categoryName = this.getCategoryName(file.category).toLowerCase();
        searchTerms[categoryName] = (searchTerms[categoryName] || 0) + 1;
      }
    });

    // Get top trending terms, exclude common words
    const excludeWords = ['page', 'html', 'file', 'website', 'design', 'template', 'the', 'and', 'for', 'with'];
    this.trendingSearches = Object.entries(searchTerms)
      .filter(([term]) => !excludeWords.includes(term) && term.length > 2)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([term]) => term);

    // Fallback to default searches if no real data available
    if (this.trendingSearches.length === 0) {
      this.trendingSearches = ['dashboard', 'portfolio', 'landing', 'admin', 'blog'];
    }
  }

  get totalFiles(): number {
    return this.files.length;
  }

  get topCategories(): Category[] {
    return this.categories
      .map(category => ({
        ...category,
        fileCount: this.getCategoryCount(category.id)
      }))
      .sort((a: any, b: any) => b.fileCount - a.fileCount)
      .slice(0, 6);
  }

  getCategoryCount(categoryId: string): number {
    return this.files.filter(file => file.category === categoryId).length;
  }

  getTagCount(tag: string): number {
    return this.files.filter(file => file.tags?.includes(tag)).length;
  }

  getCategoryName(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? this.i18n.t(category.id as any) : 'Other';
  }

  getCategoryIcon(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.icon || 'pi pi-folder';
  }

  getCategoryIconFA(categoryId?: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    if (category && category.icon) {
      switch (category.icon) {
        case 'pi-folder': return 'fa-solid fa-folder';
        case 'pi-file': return 'fa-solid fa-file-lines';
        case 'pi-image': return 'fa-solid fa-file-image';
        case 'pi-video': return 'fa-solid fa-file-video';
        case 'pi-book': return 'fa-solid fa-book';
        default: return category.icon.startsWith('fa-') ? category.icon : 'fa-solid fa-folder-open';
      }
    }
    return 'fa-solid fa-folder-open';
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
    this.searchQuery = '';
    this.filterFiles();
  }

  filterFiles(): void {
    let filtered = [...this.files];

    // Apply category filter
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      filtered = filtered.filter(file => file.category === this.selectedCategory);
    }

    // Apply selected tags filter (from multi-select)
    if (this.selectedTagsFilter && this.selectedTagsFilter.length > 0) {
      filtered = filtered.filter(file =>
        file.tags && this.selectedTagsFilter.some(tag => file.tags!.includes(tag))
      );
    }

    // Apply single tag filter
    if (this.selectedTag) {
      filtered = filtered.filter(file =>
        file.tags && file.tags.includes(this.selectedTag)
      );
    }

    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
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
      return this.i18n.t('searchResults');
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
      return this.i18n.t('noSearchResults');
    }
    if (this.selectedCategory !== 'all') {
      return 'No files in this category';
    }
    return this.i18n.t('noFiles');
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery) {
      return this.i18n.t('noSearchResultsMessage');
    }
    if (this.selectedCategory !== 'all') {
      return 'Upload some HTML files to this category to get started.';
    }
    return this.i18n.t('noFilesMessage');
  }

  // New methods for enhanced search and filtering
  onSearchChange(): void {
    this.filterFiles();
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
    if (this.showFilters) {
      this.setupFilterOptions();
    }
  }

  setSearchQuery(query: string): void {
    this.searchQuery = query;
    this.filterFiles();
  }

  onCategoryFilterChange(): void {
    this.selectedCategory = this.selectedCategoryFilter || 'all';
    this.filterFiles();
  }

  onTagsFilterChange(): void {
    this.filterFiles();
  }

  clearAllFilters(): void {
    this.searchQuery = '';
    this.selectedCategoryFilter = '';
    this.selectedTagsFilter = [];
    this.selectedCategory = 'all';
    this.selectedTag = '';
    this.filterFiles();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchQuery ||
              this.selectedCategoryFilter ||
              this.selectedTagsFilter.length > 0 ||
              this.selectedTag);
  }

  private setupFilterOptions(): void {
    // Setup category filter options
    this.categoryFilterOptions = [
      { label: this.i18n.t('allCategories'), value: '' },
      ...this.categories.map(cat => ({
        label: this.getCategoryName(cat.id),
        value: cat.id
      }))
    ];

    // Setup tag filter options
    const allTags = [...new Set(this.files.flatMap(file => file.tags || []))];
    this.tagFilterOptions = allTags.map(tag => ({
      label: tag,
      value: tag
    }));
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
              summary: this.i18n.t('success'),
              detail: this.i18n.t('fileUploaded')
            });

            this.loadData();
            this.closeUploadDialog();
          }
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.i18n.t('error'),
            detail: this.i18n.t('uploadError')
          });
        }
      });
    }
  }

  private resetUploadForm(): void {
    this.uploadForm = {
      title: '',
      category: 'other',
      tags: [],
      description: ''
    };
  }

  editFile(file: HtmlFile): void {
    this.router.navigate(['/edit', file.filename]);
  }

  viewHtml(file: HtmlFile): void {
    this.router.navigate(['/view', file.filename]);
  }

  confirmDelete(file: HtmlFile): void {
    this.confirmationService.confirm({
      message: this.i18n.t('confirmDeleteMessage'),
      header: this.i18n.t('deleteConfirm'),
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
      summary: this.i18n.t('success'),
      detail: this.i18n.t('fileDeleted')
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

  navigateToDetails(file: HtmlFile): void {
    this.router.navigate(['/view', file.filename]);
  }

  showFileActions(file: HtmlFile, event: Event): void {
    event.stopPropagation();
    console.log('Show file actions for:', file.filename);
  }
}