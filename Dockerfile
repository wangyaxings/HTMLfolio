# 多阶段构建 - 前端构建阶段
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend
COPY primeng-frontend/html-card-viewer/package*.json ./
RUN npm ci --silent --only=production

COPY primeng-frontend/html-card-viewer/ ./
RUN npm run build -- --configuration production

# 后端构建阶段
FROM golang:1.21-alpine AS backend-build

# 安装必要的工具（不包含sqlite-dev，使用纯Go实现）
RUN apk add --no-cache git ca-certificates

WORKDIR /app/backend
COPY go-backend/go.mod go-backend/go.sum ./
RUN go mod download

COPY go-backend/ ./
# 使用纯Go构建，不启用CGO
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -ldflags '-extldflags "-static"' -o main .

# 最终运行阶段
FROM alpine:latest

# 安装运行时依赖（移除sqlite）
RUN apk --no-cache add ca-certificates tzdata && \
    addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app

# 复制后端可执行文件
COPY --from=backend-build /app/backend/main .

# 复制前端静态文件
COPY --from=frontend-build /app/frontend/dist/html-card-viewer ./dist

# 创建必要目录并设置权限
RUN mkdir -p uploads db backups && \
    chown -R appuser:appgroup /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 设置环境变量（默认使用文件存储）
ENV GIN_MODE=release
ENV PORT=8080
ENV DB_TYPE=file
ENV UPLOAD_DIR=/app/uploads

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# 启动命令
CMD ["./main"]