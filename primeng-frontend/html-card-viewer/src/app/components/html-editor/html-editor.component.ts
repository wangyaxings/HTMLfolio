import { Component, OnInit } from '@angular/core';import { CommonModule } from '@angular/common';import { FormsModule } from '@angular/forms';import { ActivatedRoute, Router } from '@angular/router';import { MessageService } from 'primeng/api';import { HtmlFileService, HtmlFile } from '../../services/html-file.service';import { I18nService } from '../../services/i18n.service';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { DividerModule } from 'primeng/divider';

interface FileVersion {
  id: string;
  content: string;
  timestamp: Date;
  description: string;
  version: string;
}

@Component({
  selector: 'app-html-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    DialogModule,
    InputTextModule,
    InputTextarea,
    DropdownModule,
    DividerModule
  ],
  template: `
    <div class="editor-container">
      <!-- Editor Header -->
      <div class="editor-header">
        <div class="header-left">
                    <button pButton pRipple                  icon="fas fa-arrow-left"                  [label]="i18n.t('back')"                  class="p-button-outlined p-button-secondary"                  (click)="goBack()">          </button>
          <div class="file-info">
            <h2 *ngIf="currentFile">{{ currentFile.title || currentFile.filename }}</h2>
            <span class="file-path" *ngIf="currentFile">{{ currentFile.filename }}</span>
          </div>
        </div>

        <div class="header-actions">
                    <button pButton pRipple                  icon="fas fa-history"                  [label]="i18n.t('versionHistory')"                  class="p-button-outlined"                  [pTooltip]="i18n.t('versionHistory')"                  (click)="showVersionHistory = true"                  *ngIf="versions.length > 0">          </button>          <button pButton pRipple                  icon="fas fa-eye"                  [label]="i18n.t('preview')"                  class="p-button-outlined"                  [pTooltip]="i18n.t('preview')"                  (click)="previewContent()">          </button>          <button pButton pRipple                  icon="fas fa-save"                  [label]="i18n.t('save')"                  class="p-button-primary"                  [pTooltip]="i18n.t('save')"                  (click)="saveContent()"                  [disabled]="!hasChanges">          </button>          <button pButton pRipple                  icon="fas fa-code-branch"                  [label]="i18n.t('saveAsVersion')"                  class="p-button-success"                  [pTooltip]="i18n.t('saveAsVersion')"                  (click)="showSaveVersionDialog = true"                  [disabled]="!hasChanges">          </button>
        </div>
      </div>

      <!-- Editor Content -->
      <div class="editor-content">
        <div class="editor-sidebar">
                    <div class="sidebar-section">            <h3>{{ i18n.t('fileProperties') }}</h3>            <div class="form-field">              <label>{{ i18n.t('title') }}</label>                            <input type="text"                     pInputText                     [(ngModel)]="currentFile!.title"                     [placeholder]="i18n.t('fileTitle')">            </div>            <div class="form-field">              <label>{{ i18n.t('description') }}</label>                            <textarea pInputTextarea                        [(ngModel)]="currentFile!.description"                        [placeholder]="i18n.t('fileDescription')"                        rows="3">              </textarea>            </div>            <div class="form-field">              <label>{{ i18n.t('author') }}</label>                            <input type="text"                     pInputText                     [(ngModel)]="currentFile!.author"                     [placeholder]="i18n.t('authorName')">            </div>            <div class="form-field">              <label>{{ i18n.t('currentVersion') }}</label>                            <input type="text"                     pInputText                     [(ngModel)]="currentFile!.version"                     [placeholder]="i18n.t('versionPlaceholder')">            </div>          </div>          <div class="sidebar-section" *ngIf="versions.length > 0">            <h3>{{ i18n.t('recentVersions') }}</h3>
            <div class="version-list">
              <div class="version-item"
                   *ngFor="let version of versions.slice(0, 5)"
                   (click)="loadVersion(version)">
                <div class="version-info">
                  <span class="version-number">v{{ version.version }}</span>
                  <span class="version-date">{{ version.timestamp | date:'MM/dd HH:mm' }}</span>
                </div>
                <div class="version-description">{{ version.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="editor-main">
                    <div class="editor-toolbar">            <div class="toolbar-left">              <span class="editor-title">{{ i18n.t('htmlEditor') }}</span>              <span class="change-indicator" *ngIf="hasChanges">● {{ i18n.t('unsavedChanges') }}</span>            </div>
            <div class="toolbar-right">
                              <button pButton pRipple                        icon="fas fa-undo"                        class="p-button-text p-button-sm"                        [pTooltip]="i18n.t('undo')"                        (click)="undo()"                        [disabled]="!canUndo">              </button>              <button pButton pRipple                      icon="fas fa-redo"                      class="p-button-text p-button-sm"                      [pTooltip]="i18n.t('redo')"                      (click)="redo()"                      [disabled]="!canRedo">              </button>
            </div>
          </div>

          <div class="code-editor">
                        <textarea class="code-textarea"                      [(ngModel)]="htmlContent"                      (ngModelChange)="onContentChange()"                      [placeholder]="i18n.t('versionPlaceholder')"                      spellcheck="false">            </textarea>
          </div>
        </div>
      </div>

            <!-- 版本历史对话框 -->      <p-dialog [header]="i18n.t('versionHistory')"                [(visible)]="showVersionHistory"                [modal]="true"                [style]="{width: '800px'}"                [closable]="true">
        <div class="version-history">
          <div class="version-history-item"
               *ngFor="let version of versions"
               [class.current]="version.id === currentVersionId">
            <div class="version-header">
                            <div class="version-meta">                <span class="version-number">{{ i18n.t('versionNumber') }} {{ version.version }}</span>                <span class="version-date">{{ version.timestamp | date:'yyyy-MM-dd HH:mm:ss' }}</span>              </div>              <div class="version-actions">                <button pButton pRipple                        [label]="i18n.t('loadVersion')"                        icon="fas fa-download"                        class="p-button-text p-button-sm"                        (click)="loadVersion(version)">                </button>                <button pButton pRipple                        [label]="i18n.t('deleteVersion')"                        icon="fas fa-trash"                        class="p-button-text p-button-sm p-button-danger"                        (click)="deleteVersion(version.id)"                        [disabled]="version.id === currentVersionId">                </button>              </div>
            </div>
            <div class="version-description">{{ version.description }}</div>
          </div>
        </div>
      </p-dialog>

            <!-- 保存版本对话框 -->      <p-dialog [header]="i18n.t('saveAsVersion')"                [(visible)]="showSaveVersionDialog"                [modal]="true"                [style]="{width: '500px'}"                [closable]="true">        <div class="save-version-form">          <div class="form-field">            <label>{{ i18n.t('versionNumber') }}</label>            <input type="text"                   pInputText                   [(ngModel)]="newVersionNumber"                   [placeholder]="i18n.t('versionPlaceholder')">          </div>          <div class="form-field">            <label>{{ i18n.t('versionDescription') }}</label>            <textarea pInputTextarea                      [(ngModel)]="newVersionDescription"                      [placeholder]="i18n.t('describeChanges')"                      rows="3">            </textarea>          </div>        </div>        <ng-template pTemplate="footer">          <div class="dialog-footer">            <button pButton pRipple                    [label]="i18n.t('cancel')"                    icon="fas fa-times"                    class="p-button-text"                    (click)="showSaveVersionDialog = false">            </button>            <button pButton pRipple                    [label]="i18n.t('saveVersion')"                    icon="fas fa-code-branch"                    class="p-button-primary"                    (click)="saveAsVersion()"                    [disabled]="!newVersionNumber || !newVersionDescription">            </button>          </div>        </ng-template>      </p-dialog>      <!-- 预览对话框 -->      <p-dialog [header]="i18n.t('htmlPreview')"                [(visible)]="showPreview"                [modal]="true"                [style]="{width: '90vw', height: '90vh'}"                [closable]="true">
        <div class="preview-container">
          <iframe [srcdoc]="htmlContent"
                  class="preview-frame"
                  sandbox="allow-same-origin allow-scripts">
          </iframe>
        </div>
      </p-dialog>
    </div>
  `,
  styles: [`
    .editor-container {
      height: calc(100vh - var(--header-height) - var(--footer-height));
      display: flex;
      flex-direction: column;
      background: var(--surface-a);
    }

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-4) var(--spacing-6);
      border-bottom: 1px solid var(--border-color);
      background: var(--surface-b);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-4);
    }

    .file-info h2 {
      margin: 0;
      font-size: var(--font-size-lg);
      color: var(--text-color);
    }

    .file-path {
      font-size: var(--font-size-sm);
      color: var(--text-color-muted);
    }

    .header-actions {
      display: flex;
      gap: var(--spacing-3);
    }

    .editor-content {
      flex: 1;
      display: flex;
      overflow: hidden;
    }

    .editor-sidebar {
      width: 300px;
      background: var(--surface-b);
      border-right: 1px solid var(--border-color);
      overflow-y: auto;
      padding: var(--spacing-4);
    }

    .sidebar-section {
      margin-bottom: var(--spacing-6);
    }

    .sidebar-section h3 {
      margin: 0 0 var(--spacing-4);
      font-size: var(--font-size-base);
      color: var(--text-color);
      font-weight: var(--font-weight-semibold);
    }

    .form-field {
      margin-bottom: var(--spacing-4);
    }

    .form-field label {
      display: block;
      margin-bottom: var(--spacing-2);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      color: var(--text-color);
    }

    .version-list {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2);
    }

    .version-item {
      padding: var(--spacing-3);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      cursor: pointer;
      transition: all var(--transition-duration);
    }

    .version-item:hover {
      background: var(--surface-c);
      border-color: var(--primary-color);
    }

    .version-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-1);
    }

    .version-number {
      font-weight: var(--font-weight-semibold);
      color: var(--primary-color);
    }

    .version-date {
      font-size: var(--font-size-xs);
      color: var(--text-color-muted);
    }

    .version-description {
      font-size: var(--font-size-sm);
      color: var(--text-color-secondary);
    }

    .editor-main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .editor-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-3) var(--spacing-4);
      border-bottom: 1px solid var(--border-color);
      background: var(--surface-a);
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: var(--spacing-3);
    }

    .editor-title {
      font-weight: var(--font-weight-semibold);
      color: var(--text-color);
    }

    .change-indicator {
      color: var(--warning-color);
      font-size: var(--font-size-sm);
    }

    .toolbar-right {
      display: flex;
      gap: var(--spacing-2);
    }

    .code-editor {
      flex: 1;
      position: relative;
    }

    .code-textarea {
      width: 100%;
      height: 100%;
      border: none;
      outline: none;
      padding: var(--spacing-4);
      font-family: 'Courier New', monospace;
      font-size: 14px;
      line-height: 1.5;
      background: var(--surface-a);
      color: var(--text-color);
      resize: none;
    }

    .version-history {
      max-height: 500px;
      overflow-y: auto;
    }

    .version-history-item {
      padding: var(--spacing-4);
      border-bottom: 1px solid var(--border-color);
    }

    .version-history-item.current {
      background: var(--primary-color-light);
      border-color: var(--primary-color);
    }

    .version-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-2);
    }

    .version-meta {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-1);
    }

    .version-actions {
      display: flex;
      gap: var(--spacing-2);
    }

    .save-version-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-4);
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-3);
    }

    .preview-container {
      width: 100%;
      height: 70vh;
    }

    .preview-frame {
      width: 100%;
      height: 100%;
      border: none;
      background: white;
    }

    @media (max-width: 768px) {
      .editor-sidebar {
        width: 250px;
      }

      .header-actions {
        flex-direction: column;
        gap: var(--spacing-2);
      }
    }
  `]
})
export class HtmlEditorComponent implements OnInit {
  currentFile: HtmlFile | null = null;
  htmlContent: string = '';
  originalContent: string = '';
  hasChanges: boolean = false;

  versions: FileVersion[] = [];
  currentVersionId: string = '';

  showVersionHistory: boolean = false;
  showSaveVersionDialog: boolean = false;
  showPreview: boolean = false;

  newVersionNumber: string = '';
  newVersionDescription: string = '';

  // 撤销/重做功能
  undoStack: string[] = [];
  redoStack: string[] = [];
  canUndo: boolean = false;
  canRedo: boolean = false;

    constructor(    private route: ActivatedRoute,    private router: Router,    private htmlFileService: HtmlFileService,    private messageService: MessageService,    public i18n: I18nService  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const filename = params['filename'];
      if (filename) {
        this.loadFile(filename);
      }
    });
  }

  loadFile(filename: string): void {
    this.currentFile = this.htmlFileService.getFile(filename) || null;
    if (this.currentFile) {
      // 加载文件内容（这里需要实现从服务器获取文件内容的逻辑）
      this.loadFileContent();
      this.loadVersions();
    } else {
      this.messageService.add({
        severity: 'error',
        summary: '错误',
        detail: '文件未找到'
      });
      this.goBack();
    }
  }

  loadFileContent(): void {
    // 这里应该从服务器加载实际的HTML内容
    // 暂时使用示例内容
    this.htmlContent = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.currentFile?.title || '示例页面'}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 40px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007bff;
            padding-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${this.currentFile?.title || '欢迎'}</h1>
        <p>这是一个示例HTML文件。您可以在编辑器中修改此内容。</p>
        <p>描述: ${this.currentFile?.description || '暂无描述'}</p>
    </div>
</body>
</html>`;
    this.originalContent = this.htmlContent;
    this.updateUndoRedoState();
  }

  loadVersions(): void {
    // 加载版本历史（从localStorage或服务器）
    const savedVersions = localStorage.getItem(`versions_${this.currentFile?.filename}`);
    if (savedVersions) {
      this.versions = JSON.parse(savedVersions).map((v: any) => ({
        ...v,
        timestamp: new Date(v.timestamp)
      }));
    }
  }

  onContentChange(): void {
    this.hasChanges = this.htmlContent !== this.originalContent;
    this.updateUndoRedoState();
  }

  saveContent(): void {
    if (this.currentFile && this.hasChanges) {
      // 保存到服务器的逻辑
      this.originalContent = this.htmlContent;
      this.hasChanges = false;

      this.messageService.add({
        severity: 'success',
        summary: '保存成功',
        detail: '文件内容已保存'
      });
    }
  }

  saveAsVersion(): void {
    if (this.currentFile && this.newVersionNumber && this.newVersionDescription) {
      const newVersion: FileVersion = {
        id: Date.now().toString(),
        content: this.htmlContent,
        timestamp: new Date(),
        description: this.newVersionDescription,
        version: this.newVersionNumber
      };

      this.versions.unshift(newVersion);
      this.currentVersionId = newVersion.id;

      // 保存到localStorage
      localStorage.setItem(`versions_${this.currentFile.filename}`, JSON.stringify(this.versions));

      // 更新文件版本信息
      this.currentFile.version = this.newVersionNumber;
      this.currentFile.hasHistory = true;
      this.htmlFileService.updateFile(this.currentFile.filename, this.currentFile);

      this.showSaveVersionDialog = false;
      this.newVersionNumber = '';
      this.newVersionDescription = '';

      this.messageService.add({
        severity: 'success',
        summary: '版本已保存',
        detail: `版本 ${newVersion.version} 已创建`
      });
    }
  }

  loadVersion(version: FileVersion): void {
    this.htmlContent = version.content;
    this.currentVersionId = version.id;
    this.onContentChange();
    this.showVersionHistory = false;

    this.messageService.add({
      severity: 'info',
      summary: '版本已加载',
      detail: `已加载版本 ${version.version}`
    });
  }

  deleteVersion(versionId: string): void {
    this.versions = this.versions.filter(v => v.id !== versionId);
    localStorage.setItem(`versions_${this.currentFile?.filename}`, JSON.stringify(this.versions));

    this.messageService.add({
      severity: 'success',
      summary: '版本已删除',
      detail: '版本已从历史记录中删除'
    });
  }

  previewContent(): void {
    this.showPreview = true;
  }

  undo(): void {
    if (this.canUndo) {
      this.redoStack.push(this.htmlContent);
      this.htmlContent = this.undoStack.pop() || '';
      this.updateUndoRedoState();
      this.onContentChange();
    }
  }

  redo(): void {
    if (this.canRedo) {
      this.undoStack.push(this.htmlContent);
      this.htmlContent = this.redoStack.pop() || '';
      this.updateUndoRedoState();
      this.onContentChange();
    }
  }

  private updateUndoRedoState(): void {
    this.canUndo = this.undoStack.length > 0;
    this.canRedo = this.redoStack.length > 0;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}