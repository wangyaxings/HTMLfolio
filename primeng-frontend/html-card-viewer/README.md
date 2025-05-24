# HTML卡片查看器

基于Angular 19和PrimeNG 19构建的现代化HTML文件查看器应用。

## 技术栈

- **Angular**: 19.0.0 (最新版本)
- **PrimeNG**: 19.0.0 (最新版本)
- **PrimeIcons**: 7.0.0
- **TypeScript**: 5.6.0
- **包管理器**: Yarn 1.22.22

## 主要特性

- 🚀 使用Angular 19的standalone组件架构
- 🎨 采用PrimeNG 19的新主题系统 (Aura主题)
- 📱 响应式设计，支持移动端
- 🔄 文件上传和管理功能
- 👀 HTML文件预览功能
- 🎯 现代化的UI/UX设计

## 项目结构

```
src/
├── app/
│   ├── components/
│   │   ├── home/                 # 首页组件
│   │   └── html-viewer/          # HTML查看器组件
│   ├── services/                 # 服务层
│   ├── app.component.ts          # 根组件 (standalone)
│   └── app.routes.ts             # 路由配置
├── assets/                       # 静态资源
└── styles.css                    # 全局样式
```

## 开发环境设置

### 前置要求

- Node.js 18+
- Yarn 1.22+

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn start
```

应用将在 `http://localhost:4200` 启动。

### 构建生产版本

```bash
yarn build
```

构建文件将输出到 `dist/` 目录。

## 升级说明

本项目已从Angular 15升级到Angular 19，主要变更包括：

### Angular 19新特性
- ✅ 使用standalone组件架构
- ✅ 新的bootstrapApplication启动方式
- ✅ 简化的路由配置
- ✅ 更好的TypeScript支持

### PrimeNG 19新特性
- ✅ 新的主题系统 (@primeng/themes)
- ✅ 设计令牌 (Design Tokens) 支持
- ✅ 更好的可定制性
- ✅ 改进的性能

### 包管理器变更
- ✅ 从npm迁移到yarn
- ✅ 更快的依赖安装
- ✅ 更好的依赖锁定

## 可用脚本

- `yarn start` - 启动开发服务器
- `yarn build` - 构建生产版本
- `yarn watch` - 监听模式构建

## 浏览器支持

- Chrome (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- Edge (最新版本)

## 许可证

MIT License

## 功能

- 上传HTML文件
- 将上传的HTML文件显示为卡片
- 点击卡片查看HTML文件内容
- 删除已上传的HTML文件

## 运行项目

### 后端

```bash
cd go-backend
go run main.go
```

后端服务将在 http://localhost:8080 运行。

### 前端

```bash
cd primeng-frontend/html-card-viewer
npm install
ng serve
```

前端应用将在 http://localhost:4200 运行。

## API接口

- `POST /upload`：上传HTML文件
- `GET /uploads/{filename}`：获取已上传的HTML文件