@echo off
chcp 65001 >nul
echo ========================================
echo   HTML Card Viewer - Docker 部署
echo ========================================
echo.

echo 🔍 检查Docker环境...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未安装Docker或Docker未启动
    echo 请先安装并启动Docker Desktop
    pause
    exit /b 1
)

echo ✅ Docker环境检查完成
echo.

echo 📁 创建数据目录...
if not exist "data" mkdir data
if not exist "data\uploads" mkdir data\uploads
if not exist "data\db" mkdir data\db
if not exist "data\backups" mkdir data\backups
echo ✅ 数据目录创建完成
echo.

echo 🛠️ 停止现有容器...
docker-compose -f docker-compose-lite.yml down -v 2>nul
echo.

echo 🚀 构建并启动应用...
docker-compose -f docker-compose-lite.yml up --build -d

if %errorlevel% neq 0 (
    echo ❌ 部署失败，请检查错误信息
    pause
    exit /b 1
)

echo.
echo ⏳ 等待服务启动...
timeout /t 10 /nobreak >nul

echo 🔍 检查服务状态...
docker ps --filter "name=20250522-app-1"

echo.
echo 🎉 部署完成！
echo.
echo 📋 服务信息:
echo   应用地址:     http://localhost:8080
echo   健康检查:     http://localhost:8080/api/health
echo.
echo 📊 数据持久化:
echo   上传文件:     .\data\uploads\
echo   数据库:       .\data\db\
echo   备份:         .\data\backups\
echo.
echo 🔧 管理命令:
echo   查看日志:     docker logs -f 20250522-app-1
echo   停止服务:     docker-compose -f docker-compose-lite.yml down
echo   重启服务:     docker-compose -f docker-compose-lite.yml restart
echo.
echo 🌐 访问 http://localhost:8080 开始使用！
echo.

echo 🚀 测试应用连接...
curl -s http://localhost:8080/api/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 应用运行正常
) else (
    echo ⚠️ 应用可能还在启动中，请稍等片刻后访问
)

echo.
pause