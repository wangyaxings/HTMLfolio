# HTML Card Viewer

一个现代化的HTML文件管理和预览工具，支持文件上传、分类管理和在线预览。

## 🚀 功能特性

- ✅ HTML文件上传和管理
- ✅ 文件分类和标签系统
- ✅ 在线预览功能
- ✅ 响应式设计
- ✅ Docker容器化部署
- ✅ 健康检查监控
- ✅ 数据持久化存储

## 📋 技术栈

- **前端**: Angular 19 + PrimeNG
- **后端**: Go + Gin
- **存储**: 文件存储 (JSON)
- **部署**: Docker + Docker Compose

## 🛠️ 快速开始

### 前提条件

- Docker Desktop
- Git

### 一键部署

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd 20250522
   ```

2. **运行部署脚本**

   **Windows:**
   ```bash
   deploy.bat
   ```

   **Linux/macOS:**
   ```bash
   docker-compose -f docker-compose-lite.yml up --build -d
   ```

3. **访问应用**

   打开浏览器访问: http://localhost:8080

## 📁 项目结构

```
20250522/
├── Dockerfile                    # Docker镜像构建文件
├── docker-compose.yml          # 完整版部署配置
├── docker-compose-lite.yml     # 轻量级部署配置
├── deploy.bat                   # Windows部署脚本
├── env.example                  # 环境变量示例
├── init-db.sql                  # 数据库初始化脚本
├── go-backend/                  # Go后端代码
├── primeng-frontend/            # Angular前端代码
└── data/                        # 数据持久化目录
    ├── uploads/                 # 上传文件
    ├── db/                      # 数据库文件
    └── backups/                 # 备份文件
```

## 🔧 管理命令

### 查看服务状态
```bash
docker ps
```

### 查看日志
```bash
docker logs -f 20250522-app-1
```

### 停止服务
```bash
docker-compose -f docker-compose-lite.yml down
```

### 重启服务
```bash
docker-compose -f docker-compose-lite.yml restart
```

### 完全重新部署
```bash
docker-compose -f docker-compose-lite.yml down -v
docker-compose -f docker-compose-lite.yml up --build -d
```

## 🌐 API端点

- **健康检查**: `GET /api/health`
- **文件列表**: `GET /api/files`
- **上传文件**: `POST /api/upload`
- **删除文件**: `DELETE /api/files/{filename}`
- **分类列表**: `GET /api/categories`

## 📝 使用说明

1. 访问 http://localhost:8080 打开应用
2. 点击上传区域或拖拽HTML文件进行上传
3. 填写文件信息（标题、描述、分类、标签）
4. 上传完成后可在主页查看和预览文件
5. 支持按分类、标签筛选和搜索文件

## 🔍 故障排除

### 端口被占用
```bash
# 查看占用8080端口的进程
netstat -ano | findstr :8080

# 终止占用进程（替换PID）
taskkill /PID <PID> /F
```

### 容器启动失败
```bash
# 查看容器日志
docker logs 20250522-app-1

# 重新构建镜像
docker-compose -f docker-compose-lite.yml up --build -d
```

## 📄 许可证

MIT License

## 👨‍💻 作者

wangyaxings

---

**部署完成后访问 http://localhost:8080 开始使用！** 🎉