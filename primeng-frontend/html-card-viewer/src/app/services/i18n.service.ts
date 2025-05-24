export interface Language {
  code: string;
  name: string;
  flag: string;
}

export interface TranslationKeys {
  // Header
  appTitle: string;
  appSubtitle: string;
  toggleTheme: string;
  language: string;

  // Hero Section
  heroTitle: string;
  heroSubtitle: string;
  dropFiles: string;
  clickToBrowse: string;

  // Search & Filters
  searchPlaceholder: string;
  allCategories: string;
  allTags: string;
  filters: string;
  searchResults: string;
  trendingSearches: string;

  // File Grid
  files: string;
  file: string;
  preview: string;
  edit: string;
  delete: string;
  editInfo: string;
  viewHistory: string;
  moreActions: string;
  viewDetails: string;

  // Upload Dialog
  uploadFiles: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  selectCategory: string;
  addTags: string;
  upload: string;
  cancel: string;

  // Categories
  web: string;
  mobile: string;
  dashboard: string;
  ecommerce: string;
  portfolio: string;
  blog: string;
  documentation: string;
  template: string;

  // Messages
  fileUploaded: string;
  fileDeleted: string;
  fileUpdated: string;
  uploadError: string;
  deleteConfirm: string;
  confirmDelete: string;
  confirmDeleteMessage: string;

  // Empty States
  noFiles: string;
  noFilesMessage: string;
  noSearchResults: string;
  noSearchResultsMessage: string;

  // Common
  yes: string;
  no: string;
  save: string;
  close: string;
  loading: string;
  error: string;
  success: string;
  back: string;

  // Viewer & Editor
  copyPath: string;
  openNewTab: string;
  fileNotFound: string;
  fileNotFoundMessage: string;
  goHome: string;
  refresh: string;
  htmlEditor: string;
  unsavedChanges: string;
  undo: string;
  redo: string;
  versionHistory: string;
  saveAsVersion: string;
  loadingContent: string;
}

const translations: { [key: string]: TranslationKeys } = {
  en: {
    // Header
    appTitle: 'HTML Viewer',
    appSubtitle: 'Organize with style',
    toggleTheme: 'Toggle theme',
    language: 'Language',

    // Hero Section
    heroTitle: 'Discover the world\'s top designers',
    heroSubtitle: 'Explore work from the most talented and accomplished designers ready to take on your next project',
    dropFiles: 'Drop HTML files here',
    clickToBrowse: 'or click to browse',

    // Search & Filters
    searchPlaceholder: 'What are you looking for?',
    allCategories: 'All Categories',
    allTags: 'All Tags',
    filters: 'Filters',
    searchResults: 'Search Results',
    trendingSearches: 'Trending searches',

    // File Grid
    files: 'files',
    file: 'file',
    preview: 'Preview',
    edit: 'Edit',
    delete: 'Delete',
    editInfo: 'Edit Info',
    viewHistory: 'View History',
    moreActions: 'More Actions',
    viewDetails: 'View Details',

    // Upload Dialog
    uploadFiles: 'Upload Files',
    title: 'Title',
    description: 'Description',
    category: 'Category',
    tags: 'Tags',
    selectCategory: 'Select Category',
    addTags: 'Add tags...',
    upload: 'Upload',
    cancel: 'Cancel',

    // Categories
    web: 'Web Design',
    mobile: 'Mobile App',
    dashboard: 'Dashboard',
    ecommerce: 'E-commerce',
    portfolio: 'Portfolio',
    blog: 'Blog',
    documentation: 'Documentation',
    template: 'Template',

    // Messages
    fileUploaded: 'File uploaded successfully',
    fileDeleted: 'File deleted successfully',
    fileUpdated: 'File updated successfully',
    uploadError: 'Upload failed',
    deleteConfirm: 'Confirm Delete',
    confirmDelete: 'Confirm',
    confirmDeleteMessage: 'Are you sure you want to delete this file?',

    // Empty States
    noFiles: 'No files found',
    noFilesMessage: 'Upload your first HTML file to get started',
    noSearchResults: 'No results found',
    noSearchResultsMessage: 'Try adjusting your search or filters',

    // Common
    yes: 'Yes',
    no: 'No',
    save: 'Save',
    close: 'Close',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    back: 'Back',

    // Viewer & Editor
    copyPath: 'Copy HTML Path',
    openNewTab: 'Open in New Tab',
    fileNotFound: 'HTML File Not Found',
    fileNotFoundMessage: 'Please check if the file exists or return to the home page',
    goHome: 'Go Home',
    refresh: 'Refresh',
    htmlEditor: 'HTML Editor',
    unsavedChanges: 'Unsaved changes',
    undo: 'Undo',
    redo: 'Redo',
    versionHistory: 'Version History',
    saveAsVersion: 'Save as Version',
    loadingContent: 'Loading HTML content...'
  },
  zh: {
    // Header
    appTitle: 'HTML 查看器',
    appSubtitle: '优雅地整理',
    toggleTheme: '切换主题',
    language: '语言',

    // Hero Section
    heroTitle: '发现世界顶级设计师',
    heroSubtitle: '探索最有才华和成就的设计师作品，为您的下一个项目做好准备',
    dropFiles: '拖拽 HTML 文件到这里',
    clickToBrowse: '或点击浏览',

    // Search & Filters
    searchPlaceholder: '您在寻找什么？',
    allCategories: '所有分类',
    allTags: '所有标签',
    filters: '筛选器',
    searchResults: '搜索结果',
    trendingSearches: '热门搜索',

    // File Grid
    files: '个文件',
    file: '个文件',
    preview: '预览',
    edit: '编辑',
    delete: '删除',
    editInfo: '编辑信息',
    viewHistory: '查看历史',
    moreActions: '更多操作',
    viewDetails: '查看详情',

    // Upload Dialog
    uploadFiles: '上传文件',
    title: '标题',
    description: '描述',
    category: '分类',
    tags: '标签',
    selectCategory: '选择分类',
    addTags: '添加标签...',
    upload: '上传',
    cancel: '取消',

    // Categories
    web: '网页设计',
    mobile: '移动应用',
    dashboard: '仪表板',
    ecommerce: '电子商务',
    portfolio: '作品集',
    blog: '博客',
    documentation: '文档',
    template: '模板',

    // Messages
    fileUploaded: '文件上传成功',
    fileDeleted: '文件删除成功',
    fileUpdated: '文件更新成功',
    uploadError: '上传失败',
    deleteConfirm: '确认删除',
    confirmDelete: '确认',
    confirmDeleteMessage: '您确定要删除这个文件吗？',

    // Empty States
    noFiles: '未找到文件',
    noFilesMessage: '上传您的第一个 HTML 文件开始使用',
    noSearchResults: '未找到结果',
    noSearchResultsMessage: '尝试调整您的搜索或筛选条件',

    // Common
    yes: '是',
    no: '否',
    save: '保存',
    close: '关闭',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    back: '返回',

    // Viewer & Editor
    copyPath: '复制HTML路径',
    openNewTab: '在新标签页打开',
    fileNotFound: '未找到HTML文件',
    fileNotFoundMessage: '请检查文件是否存在或返回首页',
    goHome: '返回首页',
    refresh: '刷新',
    htmlEditor: 'HTML编辑器',
    unsavedChanges: '未保存的更改',
    undo: '撤销',
    redo: '重做',
    versionHistory: '版本历史',
    saveAsVersion: '保存为版本',
    loadingContent: '正在加载HTML内容...'
  }
};

export class I18nService {
  private currentLanguage = 'en';
  private readonly languages: Language[] = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' }
  ];

  constructor() {
    // Load saved language or detect browser language
    const savedLang = localStorage.getItem('htmlviewer-language');
    if (savedLang && translations[savedLang]) {
      this.currentLanguage = savedLang;
    } else {
      // Detect browser language
      const browserLang = navigator.language.split('-')[0];
      if (translations[browserLang]) {
        this.currentLanguage = browserLang;
      }
    }
  }

  getLanguages(): Language[] {
    return this.languages;
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  setLanguage(langCode: string): void {
    if (translations[langCode]) {
      this.currentLanguage = langCode;
      localStorage.setItem('htmlviewer-language', langCode);
    }
  }

  t(key: keyof TranslationKeys): string {
    const translation = translations[this.currentLanguage];
    return translation[key] || translations['en'][key] || key;
  }

  // Helper method for pluralization
  plural(count: number, singular: string, plural: string): string {
    return count === 1 ? singular : plural;
  }
}