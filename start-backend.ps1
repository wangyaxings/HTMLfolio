#!/usr/bin/env pwsh

# 设置控制台编码
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HTML Card Viewer - 后端服务启动" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 获取脚本所在目录
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $scriptDir "go-backend"

Write-Host "[INFO] 脚本目录: $scriptDir" -ForegroundColor Green
Write-Host "[INFO] 后端目录: $backendDir" -ForegroundColor Green
Write-Host ""

# 检查Go是否安装
Write-Host "[检查] 验证 Go 安装..." -ForegroundColor Yellow
try {
    $goVersion = go version
    Write-Host "[成功] Go 已安装: $goVersion" -ForegroundColor Green
} catch {
    Write-Host "[错误] Go 未安装或不在 PATH 中" -ForegroundColor Red
    Write-Host "请从 https://golang.org/ 下载并安装 Go" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}

# 检查go-backend目录是否存在
Write-Host "[检查] 验证后端目录..." -ForegroundColor Yellow
if (-not (Test-Path $backendDir)) {
    Write-Host "[错误] 找不到 go-backend 目录: $backendDir" -ForegroundColor Red
    Write-Host "请确保您在正确的目录中运行此脚本" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}
Write-Host "[成功] 后端目录存在" -ForegroundColor Green

# 切换到后端目录
Set-Location $backendDir

# 检查go.mod文件是否存在
Write-Host "[检查] 验证 Go 项目..." -ForegroundColor Yellow
if (-not (Test-Path "go.mod")) {
    Write-Host "[错误] 在 go-backend 目录中找不到 go.mod 文件" -ForegroundColor Red
    Write-Host "请确保 Go 项目已正确设置" -ForegroundColor Red
    Read-Host "按任意键退出"
    exit 1
}
Write-Host "[成功] Go 项目配置正确" -ForegroundColor Green

# 检查端口占用
Write-Host "[检查] 检查端口 8080 占用情况..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "[警告] 端口 8080 已被占用，服务可能无法启动" -ForegroundColor Red
    Write-Host "占用进程: $($portCheck.OwningProcess)" -ForegroundColor Red
    $choice = Read-Host "是否继续启动? (y/N)"
    if ($choice -notmatch '^[Yy]') {
        exit 1
    }
} else {
    Write-Host "[成功] 端口 8080 可用" -ForegroundColor Green
}

# 整理依赖
Write-Host "[执行] 整理 Go 依赖..." -ForegroundColor Yellow
try {
    go mod tidy
    Write-Host "[成功] Go 依赖整理完成" -ForegroundColor Green
} catch {
    Write-Host "[警告] 依赖整理失败，但继续启动: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  启动后端服务" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[启动] 在端口 8080 启动 Go 后端服务器..." -ForegroundColor Green
Write-Host "[地址] http://localhost:8080" -ForegroundColor Cyan
Write-Host "[停止] 按 Ctrl+C 停止服务器" -ForegroundColor Gray
Write-Host ""

# 启动Go服务器
try {
    # 检查main.go是否存在
    if (-not (Test-Path "main.go")) {
        Write-Host "[错误] main.go 文件不存在" -ForegroundColor Red
        Read-Host "按任意键退出"
        exit 1
    }

    Write-Host "[启动] 正在启动服务器..." -ForegroundColor Yellow
    go run main.go
} catch {
    Write-Host ""
    Write-Host "[错误] 启动服务器时出错: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "[调试信息]:" -ForegroundColor Yellow
    Write-Host "- 当前目录: $(Get-Location)" -ForegroundColor Gray
    Write-Host "- Go 版本: $(go version)" -ForegroundColor Gray
    Write-Host "- main.go 存在: $(Test-Path 'main.go')" -ForegroundColor Gray
    Write-Host ""
    Read-Host "按任意键退出"
    exit 1
} finally {
    # 确保回到原始目录
    Set-Location $scriptDir
}