import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  template: `
    <div class="home-container">
      <!-- Search and Filter Section -->
      <section class="search-section">
        <div class="search-container">
          <div class="search-input-group">
            <i class="pi pi-search search-icon"></i>
            <input
              type="text"
              pInputText
              placeholder="Search files by name, title, description, or tags..."
              [(ngModel)]="searchQuery"
              (input)="filterFiles()"
              class="search-input">
            <button
              *ngIf="searchQuery"
              pButton pRipple
              type="button"
              icon="pi pi-times"
              class="p-button-text clear-search-btn"
              (click)="clearSearch()"
              pTooltip="Clear search">
            </button>
          </div>
          <button
            pButton pRipple
            type="button"
            label="Upload Files"
            icon="pi pi-upload"
            class="upload-trigger-btn"
            (click)="showUploadDialog = true">
          </button>
        </div>
      </section>

      <!-- Category Navigation -->
      <section class="category-section">
        <div class="category-tabs">
          <div class="category-tab"
               [class.active]="selectedCategory === 'all'"
               (click)="selectCategory('all')">
            <i class="pi pi-list"></i>
            <span>All Files</span>
            <span class="category-count">{{ totalFiles }}</span>
          </div>
          <div class="category-tab"
               *ngFor="let category of categories"
               [class.active]="selectedCategory === category.id"
               (click)="selectCategory(category.id)">
            <i class="pi {{ category.icon }}" [style.color]="category.color"></i>
            <span>{{ category.name }}</span>
            <span class="category-count">{{ getCategoryCount(category.id) }}</span>
          </div>
        </div>
      </section>

      <!-- Popular Tags -->
      <section class="tags-section" *ngIf="popularTags.length > 0">
        <h3>Popular Tags</h3>
        <div class="tags-container">
          <p-tag
            *ngFor="let tag of popularTags"
            [value]="tag"
            severity="secondary"
            class="tag-chip"
            (click)="filterByTag(tag)"
            [style.cursor]="'pointer'">
          </p-tag>
        </div>
      </section>

      <!-- Files Grid -->
      <section class="files-section">
        <div class="section-header">
          <h2>{{ getSectionTitle() }}</h2>
          <div class="section-actions">
            <span class="file-count" *ngIf="displayedFiles.length > 0">
              {{ displayedFiles.length }} {{ displayedFiles.length === 1 ? 'file' : 'files' }}
            </span>
          </div>
        </div>

        <div class="grid card-grid" *ngIf="displayedFiles.length > 0">
          <div class="col-12 col-md-6 col-lg-4 col-xl-3" *ngFor="let file of displayedFiles">
            <p-card styleClass="html-file-card">
              <ng-template pTemplate="header">
                <div class="card-preview">
                  <div class="file-icon" [style.color]="getCategoryColor(file.category)">
                    <i class="pi {{ getCategoryIcon(file.category) }}"></i>
                    <span class="file-type">HTML</span>
                  </div>
                  <div class="card-actions-overlay">
                    <button pButton pRipple
                            type="button"
                            icon="pi pi-eye"
                            class="p-button-rounded p-button-text p-button-sm"
                            pTooltip="View File"
                            (click)="viewHtml(file)">
                    </button>
                    <button pButton pRipple
                            type="button"
                            icon="pi pi-pencil"
                            class="p-button-rounded p-button-text p-button-sm"
                            pTooltip="Edit Details"
                            (click)="editFile(file)">
                    </button>
                  </div>
                </div>
              </ng-template>

              <ng-template pTemplate="title">
                <div class="card-title-area">
                  <div class="card-title" [title]="file.title || file.filename">
                    {{ file.title || file.filename }}
                  </div>
                  <div class="card-meta">
                    <span class="upload-date">{{ file.uploadDate | date:'MMM dd, yyyy' }}</span>
                  </div>
                </div>
              </ng-template>

              <div class="file-content">
                <div class="file-info">
                  <div class="filename">
                    <i class="pi pi-file-o"></i>
                    <span>{{ file.filename }}</span>
                  </div>
                  <p class="description" *ngIf="file.description">{{ file.description }}</p>
                </div>

                <div class="file-tags" *ngIf="file.tags && file.tags.length > 0">
                  <p-tag
                    *ngFor="let tag of file.tags.slice(0, 3)"
                    [value]="tag"
                    severity="info"
                    class="file-tag">
                  </p-tag>
                  <span class="more-tags" *ngIf="file.tags.length > 3">
                    +{{ file.tags.length - 3 }} more
                  </span>
                </div>
              </div>

              <ng-template pTemplate="footer">
                <div class="card-footer">
                  <div class="category-indicator">
                    <i class="pi {{ getCategoryIcon(file.category) }}"
                       [style.color]="getCategoryColor(file.category)"></i>
                    <span>{{ getCategoryName(file.category) }}</span>
                  </div>
                  <div class="action-buttons">
                    <button pButton pRipple
                            type="button"
                            label="View"
                            icon="pi pi-eye"
                            class="p-button-primary p-button-sm"
                            (click)="viewHtml(file)">
                    </button>
                    <button pButton pRipple
                            type="button"
                            icon="pi pi-trash"
                            class="p-button-danger p-button-outlined p-button-sm"
                            pTooltip="Delete File"
                            (click)="confirmDelete(file)">
                    </button>
                  </div>
                </div>
              </ng-template>
            </p-card>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="displayedFiles.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-folder-open"></i>
          </div>
          <h3>{{ getEmptyStateTitle() }}</h3>
          <p>{{ getEmptyStateMessage() }}</p>
          <button pButton pRipple
                  type="button"
                  label="Upload HTML Files"
                  icon="pi pi-upload"
                  class="p-button-primary p-button-lg"
                  (click)="showUploadDialog = true">
          </button>
        </div>
      </section>

      <!-- Upload Dialog -->
      <p-dialog
        header="Upload HTML Files"
        [(visible)]="showUploadDialog"
        [style]="{width: '600px'}"
        [modal]="true"
        [draggable]="false"
        [resizable]="false">
        <div class="upload-dialog-content">
          <div class="upload-form">
            <div class="form-group">
              <label for="category">Category</label>
              <p-dropdown
                [options]="categoryOptions"
                [(ngModel)]="uploadForm.category"
                optionLabel="label"
                optionValue="value"
                placeholder="Select a category"
                class="w-full">
              </p-dropdown>
            </div>

            <div class="form-group">
              <label for="tags">Tags (optional)</label>
              <p-chips
                [(ngModel)]="uploadForm.tags"
                placeholder="Add tags..."
                class="w-full">
              </p-chips>
            </div>

            <div class="form-group">
              <label for="description">Description (optional)</label>
              <input
                type="text"
                pInputText
                [(ngModel)]="uploadForm.description"
                placeholder="Brief description of the HTML file..."
                class="w-full">
            </div>
          </div>

          <p-fileUpload #fileUpload
            name="htmlFile"
            accept=".html,.htm"
            [multiple]="true"
            (uploadHandler)="uploadFiles($event)"
            [auto]="false"
            chooseLabel="Choose Files"
            uploadLabel="Upload"
            cancelLabel="Cancel"
            [customUpload]="true"
            [showUploadButton]="true"
            [showCancelButton]="true"
            styleClass="upload-widget">
            <ng-template pTemplate="content">
              <div class="upload-content">
                <i class="pi pi-cloud-upload upload-icon"></i>
                <h4>Drag & Drop HTML Files Here</h4>
                <p>or click "Choose Files" to select files</p>
                <small>Supported formats: HTML (.html, .htm)</small>
              </div>
            </ng-template>
          </p-fileUpload>
        </div>
      </p-dialog>

      <!-- Edit File Dialog -->
      <p-dialog
        header="Edit File Details"
        [(visible)]="showEditDialog"
        [style]="{width: '500px'}"
        [modal]="true">
        <div class="edit-form" *ngIf="editingFile">
          <div class="form-group">
            <label for="editTitle">Title</label>
            <input
              type="text"
              pInputText
              [(ngModel)]="editingFile.title"
              placeholder="File title"
              class="w-full">
          </div>

          <div class="form-group">
            <label for="editCategory">Category</label>
            <p-dropdown
              [options]="categoryOptions"
              [(ngModel)]="editingFile.category"
              optionLabel="label"
              optionValue="value"
              class="w-full">
            </p-dropdown>
          </div>

          <div class="form-group">
            <label for="editTags">Tags</label>
            <p-chips
              [(ngModel)]="editingFile.tags"
              class="w-full">
            </p-chips>
          </div>

          <div class="form-group">
            <label for="editDescription">Description</label>
            <input
              type="text"
              pInputText
              [(ngModel)]="editingFile.description"
              placeholder="Description"
              class="w-full">
          </div>
        </div>

        <ng-template pTemplate="footer">
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
        </ng-template>
      </p-dialog>

      <!-- Confirmation Dialog -->
      <p-confirmDialog></p-confirmDialog>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 var(--spacing-6);
    }

    /* Search Section */
    .search-section {
      margin-bottom: var(--spacing-6);
    }

    .search-container {
      display: flex;
      gap: var(--spacing-4);
      align-items: center;
      flex-wrap: wrap;
    }

    .search-input-group {
      flex: 1;
      position: relative;
      min-width: 300px;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      z-index: 1;
    }

    .search-input {
      width: 100%;
      padding-left: 40px;
      padding-right: 40px;
      height: 48px;
      border-radius: 24px;
      border: 2px solid var(--border-color);
      transition: all 0.3s ease;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 0.2rem rgba(var(--primary-color-rgb), 0.2);
    }

    .clear-search-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
    }

    .upload-trigger-btn {
      white-space: nowrap;
    }

    /* Category Section */
    .category-section {
      margin-bottom: var(--spacing-6);
    }

    .category-tabs {
      display: flex;
      gap: var(--spacing-2);
      overflow-x: auto;
      padding: var(--spacing-2) 0;
    }

    .category-tab {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      padding: var(--spacing-3) var(--spacing-4);
      background: var(--surface-c);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      border: 2px solid transparent;
    }

    .category-tab:hover {
      background: var(--surface-d);
    }

    .category-tab.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .category-count {
      background: rgba(255, 255, 255, 0.2);
      color: inherit;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: bold;
    }

    .category-tab.active .category-count {
      background: rgba(255, 255, 255, 0.3);
    }

    /* Tags Section */
    .tags-section {
      margin-bottom: var(--spacing-6);
    }

    .tags-section h3 {
      margin-bottom: var(--spacing-3);
      color: var(--text-color);
      font-size: var(--font-size-lg);
    }

    .tags-container {
      display: flex;
      gap: var(--spacing-2);
      flex-wrap: wrap;
    }

    .tag-chip {
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .tag-chip:hover {
      transform: translateY(-2px);
    }

    /* Files Section */
    .files-section {
      margin-bottom: var(--spacing-8);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-4);
    }

    .section-header h2 {
      margin: 0;
      color: var(--text-color);
    }

    .file-count {
      font-size: var(--font-size-sm);
      color: var(--text-secondary-color);
      background-color: var(--surface-c);
      padding: var(--spacing-1) var(--spacing-3);
      border-radius: var(--border-radius-full);
      font-weight: var(--font-weight-medium);
    }

    /* Card Styles */
    .card-grid {
      margin-bottom: var(--spacing-6);
    }

    .html-file-card {
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .html-file-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }

    .card-preview {
      position: relative;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      height: 140px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .file-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--spacing-2);
    }

    .file-icon i {
      font-size: 2.5rem;
    }

    .file-type {
      font-size: var(--font-size-sm);
      font-weight: bold;
      color: var(--text-secondary-color);
    }

    .card-actions-overlay {
      position: absolute;
      top: var(--spacing-2);
      right: var(--spacing-2);
      display: flex;
      gap: var(--spacing-1);
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .html-file-card:hover .card-actions-overlay {
      opacity: 1;
    }

    .card-title-area {
      margin-bottom: var(--spacing-3);
    }

    .card-title {
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
      margin-bottom: var(--spacing-1);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .card-meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
    }

    .upload-date {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .file-content {
      margin-bottom: var(--spacing-4);
    }

    .file-info {
      margin-bottom: var(--spacing-3);
    }

    .filename {
      display: flex;
      align-items: center;
      gap: var(--spacing-2);
      margin-bottom: var(--spacing-2);
    }

    .filename i {
      color: var(--text-muted);
    }

    .filename span {
      font-size: var(--font-size-sm);
      color: var(--text-secondary-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .description {
      font-size: var(--font-size-sm);
      color: var(--text-secondary-color);
      line-height: 1.4;
      margin: 0;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .file-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-1);
      align-items: center;
    }

    .file-tag {
      font-size: 0.7rem;
    }

    .more-tags {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .category-indicator {
      display: flex;
      align-items: center;
      gap: var(--spacing-1);
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }

    .action-buttons {
      display: flex;
      gap: var(--spacing-1);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: var(--spacing-12) var(--spacing-4);
      color: var(--text-secondary-color);
    }

    .empty-icon {
      margin-bottom: var(--spacing-4);
    }

    .empty-icon i {
      font-size: 4rem;
      color: var(--text-muted);
    }

    .empty-state h3 {
      margin: 0 0 var(--spacing-2);
      color: var(--text-color);
    }

    .empty-state p {
      margin: 0 0 var(--spacing-6);
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Dialog Styles */
    .upload-dialog-content {
      padding: var(--spacing-4);
    }

    .upload-form {
      margin-bottom: var(--spacing-6);
    }

    .form-group {
      margin-bottom: var(--spacing-4);
    }

    .form-group label {
      display: block;
      margin-bottom: var(--spacing-2);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .upload-content {
      text-align: center;
      padding: var(--spacing-8) var(--spacing-4);
    }

    .upload-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-4);
    }

    .upload-content h4 {
      margin: 0 0 var(--spacing-2);
      color: var(--text-color);
    }

    .upload-content p {
      margin: 0 0 var(--spacing-4);
      color: var(--text-secondary-color);
    }

    .upload-content small {
      color: var(--text-muted);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .home-container {
        padding: 0 var(--spacing-4);
      }

      .search-container {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input-group {
        min-width: auto;
      }

      .category-tabs {
        gap: var(--spacing-1);
      }

      .category-tab {
        padding: var(--spacing-2) var(--spacing-3);
        font-size: var(--font-size-sm);
      }

      .card-footer {
        flex-direction: column;
        gap: var(--spacing-2);
        align-items: stretch;
      }

      .action-buttons {
        justify-content: center;
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

  showUploadDialog: boolean = false;
  showEditDialog: boolean = false;
  editingFile: HtmlFile | null = null;

  uploadForm = {
    category: 'other',
    tags: [] as string[],
    description: ''
  };

  categoryOptions: any[] = [];

  @ViewChild('fileUpload') fileUpload!: FileUpload;

  constructor(
    private htmlFileService: HtmlFileService,
    private messageService: MessageService,
    private router: Router,
    private confirmationService: ConfirmationService
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
    this.categoryOptions = this.categories.map(cat => ({
      label: cat.name,
      value: cat.id,
      icon: cat.icon
    }));
  }

  private updatePopularTags(): void {
    const allTags = this.htmlFileService.getAllTags();
    this.popularTags = allTags.slice(0, 10); // Show top 10 tags
  }

  get totalFiles(): number {
    return this.files.length;
  }

  getCategoryCount(categoryId: string): number {
    return this.files.filter(file => file.category === categoryId).length;
  }

  getCategoryName(categoryId?: string): string {
    if (!categoryId) return 'Other';
    const category = this.htmlFileService.getCategory(categoryId);
    return category?.name || 'Other';
  }

  getCategoryIcon(categoryId?: string): string {
    if (!categoryId) return 'pi-folder';
    const category = this.htmlFileService.getCategory(categoryId);
    return category?.icon || 'pi-folder';
  }

  getCategoryColor(categoryId?: string): string {
    if (!categoryId) return '#84CC16';
    const category = this.htmlFileService.getCategory(categoryId);
    return category?.color || '#84CC16';
  }

  selectCategory(categoryId: string): void {
    this.selectedCategory = categoryId;
    this.filterFiles();
  }

  filterFiles(): void {
    let filtered = this.files;

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = this.htmlFileService.getFilesByCategory(this.selectedCategory);
    }

    // Filter by search query
    if (this.searchQuery.trim()) {
      filtered = this.htmlFileService.searchFiles(this.searchQuery);
      if (this.selectedCategory !== 'all') {
        filtered = filtered.filter(file => file.category === this.selectedCategory);
      }
    }

    this.displayedFiles = filtered;
  }

  filterByTag(tag: string): void {
    this.searchQuery = `tag:${tag}`;
    this.filterFiles();
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filterFiles();
  }

  getSectionTitle(): string {
    if (this.searchQuery.trim()) {
      return `Search Results`;
    }
    if (this.selectedCategory === 'all') {
      return 'All Files';
    }
    const category = this.htmlFileService.getCategory(this.selectedCategory);
    return category?.name || 'Files';
  }

  getEmptyStateTitle(): string {
    if (this.searchQuery.trim()) {
      return 'No files found';
    }
    if (this.selectedCategory === 'all') {
      return 'No HTML files uploaded';
    }
    return `No ${this.getCategoryName(this.selectedCategory).toLowerCase()} files`;
  }

  getEmptyStateMessage(): string {
    if (this.searchQuery.trim()) {
      return 'Try adjusting your search terms or upload new files.';
    }
    return 'Upload your HTML files to get started and organize them by categories.';
  }

  uploadFiles(event: any): void {
    const files = event.files;

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
            this.showUploadDialog = false;
            this.resetUploadForm();
            this.fileUpload.clear();
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
}