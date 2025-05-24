# HTML卡片查看器 - 故障排除指南

## 常见问题

### 1. 文件上传失败

如果上传HTML文件后没有显示卡片或出现错误提示，请检查以下几点：

#### 后端问题
- 确保Go后端服务正在运行（在 http://localhost:8080）
- 检查后端控制台是否有任何错误日志
- 验证 `uploads` 目录是否存在且有写入权限
- 尝试重启后端服务

#### 前端问题
- 打开浏览器的开发者工具（F12），检查网络请求和控制台错误
- 确认上传的是HTML文件（扩展名为.html）
- 尝试清除浏览器缓存或使用隐私模式
- 尝试重启前端服务

### 2. 文件上传成功但卡片不显示

这可能是前端本地存储出现问题：

- 打开浏览器开发者工具 -> 应用程序 -> 本地存储
- 查看是否有 `htmlFiles` 键值对存在
- 如果不存在或数据被损坏，请尝试清除本地存储后刷新页面

### 3. 查看HTML内容时显示错误

如果点击查看按钮后无法显示HTML内容：

- 确认后端服务正在运行
- 检查文件是否已正确保存在后端的 `uploads` 目录中
- 尝试直接访问 http://localhost:8080/uploads/你的文件名.html

### 4. CORS错误

如果在控制台看到CORS相关错误：

- 确认后端已启用CORS（在main.go中已配置）
- 尝试使用相同的端口重新配置前端和后端
- 检查浏览器是否阻止了跨域请求

## 快速修复

### 重置应用

如果应用状态不正确，可以尝试以下步骤进行重置：

1. 关闭前端和后端服务
2. 清空 `go-backend/uploads` 目录
3. 在浏览器中清除本地存储
4. 重新启动后端和前端服务
5. 尝试重新上传文件

### 修改上传大小限制

如果需要上传较大的HTML文件，可修改 `go-backend/main.go` 中的限制：

```go
// 将10MB改为更大的值，例如50MB
if err := r.ParseMultipartForm(50 << 20); err != nil {
    // ...
}
```

然后重新启动后端服务。

## 备用方案

如果通过上述方法仍无法解决问题，可以尝试以下备用方案：

### 手动添加文件

1. 将HTML文件直接复制到 `go-backend/uploads` 目录中
2. 通过以下JavaScript代码手动添加文件信息到本地存储：

```javascript
// 打开浏览器控制台，粘贴以下代码
const htmlFiles = JSON.parse(localStorage.getItem('htmlFiles') || '[]');
htmlFiles.unshift({
  filename: "你的文件名.html",
  path: "/uploads/你的文件名.html",
  title: "你的文件名",
  uploadDate: new Date().toISOString()
});
localStorage.setItem('htmlFiles', JSON.stringify(htmlFiles));
// 刷新页面
location.reload();
```

# Angular 19 项目故障排除指南

## 常见问题及解决方案

### 1. 构建配置错误

#### 问题: Schema validation failed with the following errors: Data path "" must have required property 'buildTarget'

**原因**: Angular 19中`angular.json`配置文件的`serve`部分需要使用`buildTarget`而不是`browserTarget`

**解决方案**:
更新`angular.json`文件中的配置：

```json
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "configurations": {
    "production": {
      "buildTarget": "html-card-viewer:build:production"  // 改为buildTarget
    },
    "development": {
      "buildTarget": "html-card-viewer:build:development"  // 改为buildTarget
    }
  },
  "defaultConfiguration": "development"
}
```

### 2. 包管理器问题

#### 问题: error Couldn't find a package.json file

**原因**: 在错误的目录下运行yarn命令

**解决方案**:
```bash
# 确保在正确的项目目录下
cd primeng-frontend/html-card-viewer
yarn start
```

### 3. 依赖安装问题

#### 问题: 依赖安装失败或版本冲突

**解决方案**:
```bash
# 清理旧依赖
rm -rf node_modules
rm package-lock.json  # 如果存在
rm yarn.lock  # 如果需要重新生成

# 重新安装
yarn install
```

### 4. 主题样式问题

#### 问题: PrimeNG样式不显示

**原因**: PrimeNG 19使用新的主题系统

**解决方案**:
1. 确保`main.ts`中正确配置了主题：
```typescript
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

providePrimeNG({
  theme: {
    preset: Aura
  }
})
```

2. 确保`styles.css`中引入了PrimeIcons：
```css
@import 'primeicons/primeicons.css';
```

### 5. 路由问题

#### 问题: 路由不工作

**解决方案**:
1. 检查`app.routes.ts`是否正确创建
2. 确保`main.ts`中配置了`provideRouter(routes)`
3. 确保组件中正确导入了`RouterOutlet`

### 6. 组件导入错误

#### 问题: Component is not standalone

**解决方案**:
确保所有组件都标记为standalone：
```typescript
@Component({
  selector: 'app-component',
  standalone: true,
  imports: [CommonModule, /* 其他需要的模块 */],
  // ...
})
```

### 7. 开发服务器启动问题

#### 问题: 开发服务器无法启动

**检查清单**:
1. ✅ Node.js版本是否为18+
2. ✅ Yarn是否正确安装
3. ✅ 依赖是否正确安装
4. ✅ `angular.json`配置是否正确
5. ✅ 端口4200是否被占用

**解决方案**:
```bash
# 检查端口占用
netstat -an | findstr :4200

# 使用不同端口启动
yarn start --port 4201

# 重新安装CLI
npm uninstall -g @angular/cli
npm install -g @angular/cli@19
```

### 8. 构建错误

#### 问题: 构建时出现类型错误

**解决方案**:
1. 确保TypeScript版本为5.6.0
2. 检查`tsconfig.json`配置
3. 更新依赖到兼容版本

### 9. 性能问题

#### 问题: 应用启动慢或运行缓慢

**优化建议**:
1. 清理Angular缓存：`rm -rf .angular`
2. 使用开发模式：`yarn start` (默认使用development配置)
3. 检查是否有循环依赖

### 10. 版本兼容性

#### 问题: 依赖版本冲突

**解决方案**:
确保所有Angular相关包版本一致：
```json
{
  "@angular/core": "^19.0.0",
  "@angular/common": "^19.0.0",
  "@angular/router": "^19.0.0",
  "@angular/cdk": "^19.0.0",
  "primeng": "^19.0.0",
  "typescript": "~5.6.0"
}
```

## 验证工具

运行项目提供的验证脚本：
```bash
node verify-upgrade.js
```

此脚本会检查：
- 依赖版本是否正确
- 文件结构是否正确
- 配置是否正确
- 组件是否为standalone

## 获取帮助

如果以上解决方案都无法解决您的问题：

1. 检查浏览器开发者工具的控制台错误
2. 查看终端中的详细错误信息
3. 参考官方文档：
   - [Angular官方文档](https://angular.io/)
   - [PrimeNG官方文档](https://primeng.org/)
4. 运行验证脚本获取详细检查结果

## 清理命令

如果需要完全重置项目：
```bash
# 删除所有生成的文件
rm -rf node_modules
rm -rf dist
rm -rf .angular
rm yarn.lock

# 重新安装
yarn install
yarn build
```