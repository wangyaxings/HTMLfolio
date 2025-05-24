# Angular 15 到 Angular 19 升级指南

本文档详细说明了如何将前端项目从Angular 15升级到Angular 19，并从npm迁移到yarn包管理器。

## 升级概览

### 主要变更
- **Angular**: 15.2.0 → 19.0.0
- **PrimeNG**: 15.2.0 → 19.0.0
- **TypeScript**: 4.9.4 → 5.6.0
- **包管理器**: npm → yarn
- **架构**: NgModule → Standalone Components

## 详细升级步骤

### 1. 环境准备

确保系统已安装yarn：
```bash
# 检查yarn版本
yarn --version

# 如果未安装，可通过npm安装
npm install -g yarn
```

### 2. 清理旧依赖

```bash
# 删除旧的lock文件和node_modules
rm package-lock.json
rm -rf node_modules
```

### 3. 更新package.json

将所有Angular相关依赖升级到19.0.0版本：

```json
{
  "dependencies": {
    "@angular/animations": "^19.0.0",
    "@angular/common": "^19.0.0",
    "@angular/compiler": "^19.0.0",
    "@angular/core": "^19.0.0",
    "@angular/forms": "^19.0.0",
    "@angular/platform-browser": "^19.0.0",
    "@angular/platform-browser-dynamic": "^19.0.0",
    "@angular/router": "^19.0.0",
    "@angular/cdk": "^19.0.0",
    "@primeng/themes": "^19.1.3",
    "primeicons": "^7.0.0",
    "primeng": "^19.0.0",
    "rxjs": "~7.8.0",
    "tslib": "^2.3.0",
    "zone.js": "~0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "^19.0.0",
    "@angular/cli": "^19.0.0",
    "@angular/compiler-cli": "^19.0.0",
    "typescript": "~5.6.0"
  }
}
```

### 4. 安装新依赖

```bash
yarn install
```

### 5. 架构迁移：从NgModule到Standalone

#### 5.1 更新main.ts

**旧版本 (NgModule):**
```typescript
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
```

**新版本 (Standalone):**
```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
}).catch(err => console.error(err));
```

#### 5.2 创建新的路由配置

创建 `src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { HtmlViewerComponent } from './components/html-viewer/html-viewer.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'view/:filename', component: HtmlViewerComponent },
  { path: '**', redirectTo: '' }
];
```

#### 5.3 转换组件为Standalone

**AppComponent:**
```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastModule, ButtonModule],
  providers: [MessageService],
  // ... 模板和样式
})
export class AppComponent { }
```

**HomeComponent:**
```typescript
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FileUploadModule, CardModule, ButtonModule],
  // ... 模板和样式
})
export class HomeComponent { }
```

**HtmlViewerComponent:**
```typescript
@Component({
  selector: 'app-html-viewer',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule],
  // ... 模板和样式
})
export class HtmlViewerComponent { }
```

### 6. PrimeNG 19主题系统更新

#### 6.1 更新angular.json

移除旧的主题引用：
```json
"styles": [
  "src/assets/themes.css",
  "src/styles.css"
]
```

#### 6.2 更新styles.css

添加PrimeIcons引用：
```css
/* 引入PrimeIcons */
@import 'primeicons/primeicons.css';

/* 其他全局样式 */
```

### 7. 清理不需要的文件

删除以下文件：
- `src/app/app.module.ts`
- `src/app/app-routing.module.ts`

### 8. 验证升级

```bash
# 构建项目
yarn build

# 启动开发服务器
yarn start
```

## 升级后的优势

### Angular 19新特性
- **更好的性能**: 改进的变更检测和渲染
- **Standalone组件**: 简化的架构，更好的树摇优化
- **改进的开发体验**: 更好的错误信息和调试工具
- **更小的包体积**: 更好的代码分割和优化

### PrimeNG 19新特性
- **新主题系统**: 基于设计令牌的主题定制
- **更好的可访问性**: 改进的ARIA支持
- **性能优化**: 更快的组件渲染
- **现代化设计**: 更新的UI组件和样式

### Yarn优势
- **更快的安装**: 并行下载和缓存机制
- **更好的依赖管理**: 确定性的依赖解析
- **离线支持**: 缓存的包可离线安装
- **工作区支持**: 更好的monorepo支持

## 常见问题

### Q: 升级后组件样式丢失
A: 确保在styles.css中正确引入了PrimeIcons，并且组件中正确导入了所需的PrimeNG模块。

### Q: 路由不工作
A: 检查app.routes.ts文件是否正确创建，并且在main.ts中正确配置了provideRouter。

### Q: 构建错误
A: 确保所有组件都正确转换为standalone组件，并且导入了必要的模块。

### Q: 主题不生效
A: 确保在main.ts中正确配置了providePrimeNG，并且移除了angular.json中的旧主题引用。

## 总结

通过以上步骤，你的Angular项目已成功升级到最新版本，享受更好的性能、开发体验和现代化的功能特性。