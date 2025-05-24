@echo off
chcp 65001 >nul
title HTML Card Viewer - 启动脚本
color 0A

echo.
echo ========================================
echo   HTML Card Viewer - 启动脚本
echo ========================================
echo.

REM 设置脚本目录
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo [INFO] 当前目录: %CD%
echo.

REM 检查 Node.js 是否安装
echo [检查] 验证 Node.js 安装...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Node.js 未安装或不在 PATH 中
    echo 请从 https://nodejs.org/ 下载并安装 Node.js
    pause
    exit /b 1
)
echo [成功] Node.js 已安装

REM 检查 Go 是否安装
echo [检查] 验证 Go 安装...
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Go 未安装或不在 PATH 中
    echo 请从 https://golang.org/ 下载并安装 Go
    pause
    exit /b 1
)
echo [成功] Go 已安装

REM 检查项目目录结构
echo [检查] 验证项目结构...
if not exist "go-backend\" (
    echo [错误] go-backend 目录不存在
    pause
    exit /b 1
)
if not exist "primeng-frontend\html-card-viewer\" (
    echo [错误] primeng-frontend\html-card-viewer 目录不存在
    pause
    exit /b 1
)
echo [成功] 项目结构正确

REM 检查前端依赖
echo [检查] 检查前端依赖...
if not exist "primeng-frontend\html-card-viewer\node_modules\" (
    echo [信息] 前端依赖未安装，正在安装...
    cd "primeng-frontend\html-card-viewer"
    echo [执行] npm install...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 前端依赖安装失败
        cd "%SCRIPT_DIR%"
        pause
        exit /b 1
    )
    cd "%SCRIPT_DIR%"
    echo [成功] 前端依赖安装完成
) else (
    echo [成功] 前端依赖已存在
)

REM 检查后端依赖
echo [检查] 检查后端依赖...
cd "go-backend"
if not exist "go.mod" (
    echo [错误] go.mod 文件不存在
    cd "%SCRIPT_DIR%"
    pause
    exit /b 1
)
go mod tidy >nul 2>&1
cd "%SCRIPT_DIR%"
echo [成功] 后端依赖检查完成

REM 检查端口占用
echo [检查] 检查端口占用...
netstat -an | findstr ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 8080 已被占用，后端可能无法启动
)
netstat -an | findstr ":4200" >nul 2>&1
if %errorlevel% equ 0 (
    echo [警告] 端口 4200 已被占用，前端可能无法启动
)

echo.
echo ========================================
echo   启动服务
echo ========================================
echo.

REM 启动后端服务
echo [启动] 正在启动后端服务...
cd "go-backend"
start "HTML Card Viewer - 后端服务" cmd /k "echo 启动 Go 后端服务... && echo 服务地址: http://localhost:8080 && echo 按 Ctrl+C 停止服务 && echo. && go run main.go"
cd "%SCRIPT_DIR%"

REM 等待后端启动
echo [等待] 等待后端服务启动...
timeout /t 5 /nobreak >nul

REM 测试后端是否启动成功
echo [测试] 检查后端服务状态...
for /l %%i in (1,1,10) do (
    curl -s http://localhost:8080 >nul 2>&1
    if !errorlevel! equ 0 (
        echo [成功] 后端服务已启动
        goto backend_ready
    )
    echo [等待] 后端服务启动中... (%%i/10)
    timeout /t 2 /nobreak >nul
)
echo [警告] 无法确认后端服务状态，但继续启动前端...

:backend_ready
REM 启动前端服务
echo [启动] 正在启动前端服务...
cd "primeng-frontend\html-card-viewer"
start "HTML Card Viewer - 前端服务" cmd /k "echo 启动 Angular 开发服务器... && echo 服务地址: http://localhost:4200 && echo 按 Ctrl+C 停止服务 && echo. && ng serve --host 0.0.0.0 --port 4200"
cd "%SCRIPT_DIR%"

REM 等待前端启动
echo [等待] 等待前端服务启动...
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   启动完成
echo ========================================
echo.
echo [后端服务] http://localhost:8080
echo [前端应用] http://localhost:4200
echo.
echo [说明] 两个服务窗口已打开:
echo        - 后端服务: Go 服务器
echo        - 前端服务: Angular 开发服务器
echo.
echo [注意] 保持两个服务窗口打开以维持服务运行
echo        关闭窗口或按 Ctrl+C 可停止对应服务
echo.

REM 等待前端完全启动后打开浏览器
echo [等待] 等待前端完全启动...
timeout /t 10 /nobreak >nul

echo [打开] 正在打开浏览器...
start http://localhost:4200

echo.
echo 启动完成！如需重新启动，请关闭服务窗口后重新运行此脚本。
echo.
pause