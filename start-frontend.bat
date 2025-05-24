@echo off
chcp 65001 >nul
title HTML Card Viewer - 前端启动
color 0B

echo.
echo ========================================
echo   HTML Card Viewer - 前端启动
echo ========================================
echo.

REM 设置脚本目录
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [INFO] 当前目录: %CD%
echo.

REM 检查 Node.js
echo [检查] 验证 Node.js...
node --version
if %errorlevel% neq 0 (
    echo [错误] Node.js 未安装
    pause
    exit /b 1
)

REM 检查 Angular CLI
echo [检查] 验证 Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] Angular CLI 未全局安装，使用本地版本
    echo [执行] 正在安装 Angular CLI...
    npm install -g @angular/cli
)

REM 进入前端目录
echo [导航] 进入前端项目目录...
if not exist "primeng-frontend\html-card-viewer\" (
    echo [错误] 前端项目目录不存在
    pause
    exit /b 1
)

cd "primeng-frontend\html-card-viewer"
echo [INFO] 当前目录: %CD%

REM 检查依赖
echo [检查] 检查项目依赖...
if not exist "node_modules\" (
    echo [信息] 依赖未安装，正在安装...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
) else (
    echo [信息] 依赖已存在，检查更新...
    call npm audit fix >nul 2>&1
)

REM 清理缓存（如果需要）
echo [清理] 清理 Angular 缓存...
ng cache clean >nul 2>&1

echo.
echo ========================================
echo   启动前端开发服务器
echo ========================================
echo.

echo [启动] 正在启动 Angular 开发服务器...
echo [地址] http://localhost:4200
echo [说明] 服务器启动需要一些时间，请耐心等待
echo [停止] 按 Ctrl+C 停止服务器
echo.

REM 启动开发服务器
ng serve --host 0.0.0.0 --port 4200 --open

echo.
echo 前端服务已停止。
pause