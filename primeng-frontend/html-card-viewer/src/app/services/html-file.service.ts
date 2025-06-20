import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface HtmlFile {
  id?: string;
  filename: string;
  path: string;
  title?: string;
  uploadDate: Date;
  lastModified?: Date;
  category?: string;
  tags?: string[];
  description?: string;
  author?: string;
  version?: string;
  fileSize?: number;
  thumbnailLoaded?: boolean;
  thumbnailState?: 'loading' | 'loaded' | 'error';
  hasHistory?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class HtmlFileService {
  private apiUrl = '/api';
  private files: HtmlFile[] = [];

  // Predefined categories
  private categories: Category[] = [
    { id: 'dashboard', name: 'Dashboard', icon: 'pi-chart-line', color: '#3B82F6' },
    { id: 'portfolio', name: 'Portfolio', icon: 'pi-briefcase', color: '#10B981' },
    { id: 'documentation', name: 'Documentation', icon: 'pi-book', color: '#F59E0B' },
    { id: 'template', name: 'Template', icon: 'pi-palette', color: '#EF4444' },
    { id: 'landing', name: 'Landing Page', icon: 'pi-home', color: '#8B5CF6' },
    { id: 'admin', name: 'Admin Panel', icon: 'pi-cog', color: '#6B7280' },
    { id: 'ecommerce', name: 'E-commerce', icon: 'pi-shopping-cart', color: '#EC4899' },
    { id: 'blog', name: 'Blog', icon: 'pi-pencil', color: '#06B6D4' },
    { id: 'other', name: 'Other', icon: 'pi-folder', color: '#84CC16' }
  ];

  constructor(private http: HttpClient) {
    // 首先从本地存储加载备份数据
    this.loadFromLocalStorage();
    this.loadCategoriesFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const savedFiles = localStorage.getItem('htmlFiles');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        // Ensure date properties are Date objects
        this.files = parsedFiles.map((file: any) => ({
          ...file,
          uploadDate: new Date(file.uploadDate),
          tags: file.tags || [],
          category: file.category || 'other'
        }));
      } catch (e) {
        console.error('Unable to parse saved file data', e);
        this.files = [];
      }
    }
  }

  private loadCategoriesFromLocalStorage(): void {
    const savedCategories = localStorage.getItem('htmlCategories');
    if (savedCategories) {
      try {
        const parsedCategories = JSON.parse(savedCategories);
        // Merge with default categories, giving priority to saved ones
        const defaultCategoryIds = this.categories.map(cat => cat.id);
        const customCategories = parsedCategories.filter((cat: Category) =>
          !defaultCategoryIds.includes(cat.id)
        );
        this.categories = [...this.categories, ...customCategories];
      } catch (e) {
        console.error('Unable to parse saved categories data', e);
      }
    }
  }

  // Get all HTML files
  getFiles(): HtmlFile[] {
    return this.files;
  }

  // Get files by category
  getFilesByCategory(categoryId: string): HtmlFile[] {
    return this.files.filter(file => file.category === categoryId);
  }

  // Get files by search query
  searchFiles(query: string): HtmlFile[] {
    if (!query.trim()) {
      return this.files;
    }

    const lowercaseQuery = query.toLowerCase();
    return this.files.filter(file =>
      file.filename.toLowerCase().includes(lowercaseQuery) ||
      file.title?.toLowerCase().includes(lowercaseQuery) ||
      file.description?.toLowerCase().includes(lowercaseQuery) ||
      file.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  // Get files by tag
  getFilesByTag(tag: string): HtmlFile[] {
    return this.files.filter(file =>
      file.tags?.some(fileTag => fileTag.toLowerCase() === tag.toLowerCase())
    );
  }

  // Get all unique tags
  getAllTags(): string[] {
    const allTags = this.files.flatMap(file => file.tags || []);
    return [...new Set(allTags)].sort();
  }

  // Get available categories
  getCategories(): Category[] {
    return this.categories;
  }

  // Get category by id
  getCategory(categoryId: string): Category | undefined {
    return this.categories.find(cat => cat.id === categoryId);
  }

  // Get single HTML file
  getFile(filename: string): HtmlFile | undefined {
    return this.files.find(file => file.filename === filename);
  }

  // Upload HTML file
  uploadFile(file: File, category: string = 'other', tags: string[] = [], description?: string): Observable<any> {
    const formData = new FormData();
    formData.append('htmlFile', file);
    formData.append('category', category);
    formData.append('tags', tags.join(','));
    if (description) {
      formData.append('description', description);
    }

    // Set request headers
    const headers = new HttpHeaders();
    // Don't set Content-Type, let browser automatically set multipart/form-data

    return this.http.post(`${this.apiUrl}/upload`, formData, { headers })
      .pipe(
        tap((response: any) => {
          console.log('Upload response:', response);
          // 不在这里自动刷新，改为在组件中统一处理
        }),
        catchError(this.handleError)
      );
  }

  // Update file metadata
  updateFile(filename: string, updates: Partial<HtmlFile>): boolean {
    const fileIndex = this.files.findIndex(file => file.filename === filename);
    if (fileIndex !== -1) {
      this.files[fileIndex] = { ...this.files[fileIndex], ...updates };
      this.saveToLocalStorage();
      return true;
    }
    return false;
  }

  // Delete HTML file
  deleteFile(filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/files/${filename}`)
      .pipe(
        tap(() => {
          // Remove from local array
          const index = this.files.findIndex(file => file.filename === filename);
          if (index !== -1) {
            this.files.splice(index, 1);
          }
        }),
        catchError(this.handleError)
      );
  }

  // Category management methods
  addCategory(category: Category): void {
    // Check if category with same id already exists
    const existingIndex = this.categories.findIndex(cat => cat.id === category.id);
    if (existingIndex !== -1) {
      // Update existing category
      this.categories[existingIndex] = category;
    } else {
      // Add new category
      this.categories.push(category);
    }
    this.saveCategoriesToLocalStorage();
  }

  deleteCategory(categoryId: string): void {
    const index = this.categories.findIndex(cat => cat.id === categoryId);
    if (index !== -1) {
      this.categories.splice(index, 1);
      this.saveCategoriesToLocalStorage();

      // Update files that had this category to 'other'
      this.files.forEach(file => {
        if (file.category === categoryId) {
          file.category = 'other';
        }
      });
      this.saveToLocalStorage();
    }
  }

  // Save categories to local storage
  private saveCategoriesToLocalStorage(): void {
    localStorage.setItem('htmlCategories', JSON.stringify(this.categories));
  }

  // Refresh files from server
  private refreshFilesFromServer(): Observable<HtmlFile[]> {
    console.log('Refreshing files from server...');
    return this.http.get<HtmlFile[]>(`${this.apiUrl}/files`)
      .pipe(
        tap((files) => {
          console.log('Files loaded from server:', files);
          this.files = files.map(file => ({
            ...file,
            uploadDate: new Date(file.uploadDate),
            tags: file.tags || [],
            category: file.category || 'other'
          }));
          // Save to local storage as backup
          this.saveToLocalStorage();
        }),
        catchError(this.handleError)
      );
  }

  // Force refresh files from server (public method) - now returns Observable
  refreshFiles(): Observable<HtmlFile[]> {
    return this.refreshFilesFromServer();
  }

  // Refresh categories from server
  private refreshCategoriesFromServer(): void {
    this.http.get<Category[]>(`${this.apiUrl}/categories`)
      .pipe(catchError(this.handleError))
      .subscribe({
        next: (categories) => {
          // Merge server categories with defaults
          const serverCategoryIds = categories.map(cat => cat.id);
          const defaultCategories = this.categories.filter(cat => !serverCategoryIds.includes(cat.id));
          this.categories = [...categories, ...defaultCategories];
        },
        error: (error) => {
          console.error('Failed to load categories from server:', error);
          this.loadCategoriesFromLocalStorage(); // Fallback to local storage
        }
      });
  }

  // Save file list to local storage (backup)
  private saveToLocalStorage(): void {
    localStorage.setItem('htmlFiles', JSON.stringify(this.files));
  }

  // Handle HTTP errors
  private handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server returned code: ${error.status}, error message: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}