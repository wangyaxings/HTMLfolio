@echo off
chcp 65001 >nul
title HTML Card Viewer - 快速启动
color 0E

echo.
echo ========================================
echo   HTML Card Viewer - 快速启动
echo ========================================
echo.

REM 基本检查
if not exist "go-backend\main.go" (
    echo [错误] 后端文件缺失
    pause
    exit /b 1
)

if not exist "primeng-frontend\html-card-viewer\package.json" (
    echo [错误] 前端项目缺失
    pause
    exit /b 1
)

echo [信息] 正在快速启动前后端服务...
echo.

REM 启动后端（在新窗口）
echo [1/3] 启动后端服务...
start "后端服务" .\start-backend.ps1

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动前端（在新窗口）
echo [2/3] 启动前端服务...
start "前端服务" .\start-frontend.bat

REM 等待前端启动
echo [3/3] 等待服务启动完成...
timeout /t 8 /nobreak >nul

echo.
echo [完成] 服务启动中...
echo.
echo 前端地址: http://localhost:4200
echo 后端地址: http://localhost:8080
echo.
echo 正在打开浏览器...
timeout /t 5 /nobreak >nul
start http://localhost:4200

echo.
echo 启动完成！
pause