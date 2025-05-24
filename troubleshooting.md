# 故障排除指南

## 常见问题

### 1. 文件上传失败
- 确保Go后端服务正在运行（http://localhost:8080）
- 确保上传的是HTML文件（.html扩展名）
- 检查浏览器开发者工具中的网络和控制台错误

### 2. 文件显示问题
- 确认后端uploads目录中有文件
- 清除浏览器缓存并刷新页面
- 检查localStorage中是否有htmlFiles数据

### 3. CORS错误
- 确认后端已启用CORS配置
- 重启前端和后端服务

## 快速修复

### 重置应用
1. 关闭前端和后端服务
2. 清空`go-backend/uploads`目录
3. 清除浏览器localStorage
4. 重启服务

### Angular 19常见问题
- 依赖安装失败：删除node_modules和yarn.lock，重新运行`yarn install`
- 路由不工作：检查app.routes.ts和provideRouter配置
- 组件导入错误：确保组件标记为standalone

更多详细信息请参考README.md文件。