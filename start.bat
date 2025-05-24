@echo off
title HTML卡片查看器 - 启动脚本
echo ========================================
echo    HTML卡片查看器 - Angular 19版本
echo ========================================
echo.

:: 检查yarn是否安装
where yarn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [错误] 未找到yarn，请先安装yarn
    echo 运行: npm install -g yarn
    pause
    exit /b 1
)

:: 检查项目目录
if not exist "primeng-frontend\html-card-viewer\package.json" (
    echo [错误] 未找到Angular项目，请确认在正确的目录下运行
    pause
    exit /b 1
)

echo [信息] 进入前端项目目录...
cd /d "primeng-frontend\html-card-viewer"

echo [信息] 检查依赖是否已安装...
if not exist "node_modules" (
    echo [信息] 首次运行，正在安装依赖...
    yarn install
    if %ERRORLEVEL% NEQ 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo [信息] 依赖已存在，跳过安装
)

echo.
echo [信息] 启动Angular开发服务器...
echo [信息] 应用将在 http://localhost:4200 启动
echo [信息] 按 Ctrl+C 停止服务器
echo.

yarn start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [错误] 启动失败，请检查错误信息
    pause
    exit /b 1
)

pause