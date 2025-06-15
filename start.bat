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
for /f %%i in ('node --version') do set NODE_VERSION=%%i
echo [成功] Node.js 已安装 - 版本: %NODE_VERSION%

REM 检查 Go 是否安装
echo [检查] 验证 Go 安装...
go version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] Go 未安装或不在 PATH 中
    echo 请从 https://golang.org/ 下载并安装 Go
    pause
    exit /b 1
)
for /f "tokens=3" %%i in ('go version') do set GO_VERSION=%%i
echo [成功] Go 已安装 - 版本: %GO_VERSION%

REM 检查Angular CLI
echo [检查] 验证 Angular CLI...
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] Angular CLI 未安装，正在全局安装...
    npm install -g @angular/cli
    if %errorlevel% neq 0 (
        echo [错误] Angular CLI 安装失败
        pause
        exit /b 1
    )
)
echo [成功] Angular CLI 已安装

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

REM 清理端口（如果被占用）
echo [清理] 检查并清理端口占用...
netstat -ano | findstr ":8080" >nul 2>&1
if %errorlevel% equ 0 (
    echo [清理] 端口 8080 被占用，尝试释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080"') do taskkill /f /pid %%a >nul 2>&1
)
netstat -ano | findstr ":4200" >nul 2>&1
if %errorlevel% equ 0 (
    echo [清理] 端口 4200 被占用，尝试释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":4200"') do taskkill /f /pid %%a >nul 2>&1
)

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
    echo [检查] 验证依赖是否最新...
    cd "primeng-frontend\html-card-viewer"
    call npm audit --audit-level=moderate >nul 2>&1
    if %errorlevel% neq 0 (
        echo [警告] 发现安全漏洞，建议运行 npm audit fix
    )
    cd "%SCRIPT_DIR%"
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
echo [执行] go mod tidy && go mod download...
go mod tidy
go mod download
if %errorlevel% neq 0 (
    echo [警告] 后端依赖下载可能出现问题
)
cd "%SCRIPT_DIR%"
echo [成功] 后端依赖检查完成

REM 创建数据目录（如果不存在）
echo [创建] 确保数据目录存在...
if not exist "data\uploads\" mkdir "data\uploads"
if not exist "data\backups\" mkdir "data\backups"
if not exist "data\db\" mkdir "data\db"
echo [成功] 数据目录已创建

echo.
echo ========================================
echo   启动服务
echo ========================================
echo.

REM 启动后端服务
echo [启动] 正在启动后端服务...
cd "go-backend"
start "HTML Card Viewer - 后端服务 (Go:8080)" cmd /k "echo ============================================ && echo    HTML Card Viewer - 后端服务 && echo    服务地址: http://localhost:8080 && echo    API 文档: http://localhost:8080/api/docs && echo ============================================ && echo. && echo [启动] 正在启动 Go 服务器... && echo. && go run main.go"
cd "%SCRIPT_DIR%"

REM 等待后端启动
echo [等待] 等待后端服务启动...
timeout /t 3 /nobreak >nul

REM 测试后端是否启动成功
echo [测试] 检查后端服务状态...
for /l %%i in (1,1,15) do (
    powershell -Command "(Invoke-WebRequest -Uri http://localhost:8080 -TimeoutSec 2).StatusCode" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [成功] 后端服务已启动 (http://localhost:8080)
        goto backend_ready
    )
    echo [等待] 后端服务启动中... (%%i/15)
    timeout /t 2 /nobreak >nul
)
echo [警告] 无法确认后端服务状态，但继续启动前端...

:backend_ready
REM 启动前端服务
echo [启动] 正在启动前端服务...
cd "primeng-frontend\html-card-viewer"
start "HTML Card Viewer - 前端服务 (Angular:4200)" cmd /k "echo ============================================ && echo    HTML Card Viewer - 前端服务 && echo    开发服务器: http://localhost:4200 && echo    网络访问: http://0.0.0.0:4200 && echo ============================================ && echo. && echo [启动] 正在启动 Angular 开发服务器... && echo [提示] 首次启动可能需要较长时间 && echo. && ng serve --host 0.0.0.0 --port 4200 --live-reload --open=false"
cd "%SCRIPT_DIR%"

REM 等待前端启动
echo [等待] 等待前端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo   开发环境信息
echo ========================================
echo.
echo [服务地址]
echo   后端 API:    http://localhost:8080
echo   前端应用:    http://localhost:4200
echo   网络访问:    http://192.168.x.x:4200
echo.
echo [开发工具]
echo   API 测试:    可使用 Postman 或 curl 测试 API
echo   数据库:      数据存储在 data/db/ 目录
echo   日志:        查看服务窗口的控制台输出
echo   热重载:      前端代码修改会自动刷新
echo.
echo [快捷操作]
echo   1. 打开 VSCode: code .
echo   2. 查看日志:   保持服务窗口打开
echo   3. 重启服务:   关闭服务窗口后重新运行此脚本
echo   4. 清理端口:   运行此脚本会自动清理
echo.

REM 询问是否打开开发工具
set /p OPEN_TOOLS="是否打开开发工具? (y/n): "
if /i "%OPEN_TOOLS%"=="y" (
    echo [打开] 启动开发工具...
    start code .
    timeout /t 2 /nobreak >nul
)

REM 等待前端完全启动后打开浏览器
echo [等待] 等待前端完全启动...
for /l %%i in (1,1,30) do (
    powershell -Command "(Invoke-WebRequest -Uri http://localhost:4200 -TimeoutSec 2).StatusCode" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [成功] 前端服务已启动
        goto frontend_ready
    )
    timeout /t 2 /nobreak >nul
)

:frontend_ready
echo [打开] 正在打开浏览器...
start http://localhost:4200

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 开发环境已启动完成！
echo.
echo [注意事项]
echo - 保持两个服务窗口打开以维持服务运行
echo - 前端代码修改会自动热重载
echo - 后端代码修改需要重启后端服务
echo - 数据会保存在 data/ 目录中
echo - 如遇问题，请检查端口占用或重新运行脚本
echo.
echo 按任意键关闭此窗口...
pause >nul